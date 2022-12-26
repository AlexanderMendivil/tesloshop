import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { validate as IsUuid } from "uuid"
import { ProductImage, Product } from './entities';
@Injectable()
export class ProductsService {


  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImagesRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
    ){}

  private readonly logger = new Logger("ProductService");
  async create(createProductDto: CreateProductDto) {

    try{

      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({ 
        ...productDetails, 
        images:  images.map( image => this.productImagesRepository.create({ url: image }))
      });

      await this.productRepository.save(product);
      return { ...product, images };
    }catch(e){
      this.handleException(e);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try{
      const { limit, offset } = paginationDto;
      const products = await this.productRepository.find({take: limit, skip: offset, relations: {
        images: true
      }});

      return products.map( ({images, ...rest}) => ( {...rest, images: images.map( img => img.url )} ));

    }catch(e){
      this.handleException(e);
    }
  }

  async findOne(term: string) {

    try{

      let product: Product;
      
      if(IsUuid(term)){
        product = await this.productRepository.findOneBy({ id: term });        
      }else{
        const queryBuilder = this.productRepository.createQueryBuilder('prod');
        product =  await queryBuilder.where(
          `UPPER(title) =:title or LOWER(slug) =:slug`, 
          {title: term.toUpperCase(), slug: term.toLowerCase()})
          .leftJoinAndSelect('prod.images', 'prodImages')
          .getOne();
      }

      if(!product)
      throw new NotFoundException(`Product with id: ${term} not found`);
      return product;
      
    }catch(e: any){
      this.handleException(e)
    }
    
  }

  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );
    return{
      ...rest,
      images: images.map( image => image.url )
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({id, ...toUpdate });
    if(!product) throw new NotFoundException(`Product with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try{

      if(images){
        await queryRunner.manager.delete( ProductImage, {product: { id } });
        product.images = images.map( img => this.productImagesRepository.create({url: img}));
      }else{

      }
      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain( id );
      
    }catch(e){
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleException(e);
    }
  }

  async remove(id: string) {
    try{

      const product = await this.findOne( id );
      await this.productRepository.remove(product);
    }catch(e){
      this.handleException(e)
    }
  }

  private handleException(error: any){
    if(error.code === "23505")
      throw new BadRequestException(error.detail);

      this.logger.error(error);
      throw new InternalServerErrorException("Unexpected error, check logs");
  }

  async deleteAllProducts(){
    const query =  this.productRepository.createQueryBuilder('product');

    try{
      return await query.delete().where({}).execute();
    }catch(e){
      this.handleException(e);
    }
  }
}
