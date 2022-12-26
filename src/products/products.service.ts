import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { validate as IsUuid } from "uuid"
import { ProductImage, Product } from './entities';
@Injectable()
export class ProductsService {


  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImagesRepository: Repository<ProductImage>
    ){}

  private readonly logger = new Logger("ProductService")
  async create(createProductDto: CreateProductDto) {

    try{

      const { images = [], ...productDetails } = createProductDto 
      const product = this.productRepository.create({ 
        ...productDetails, 
        images:  images.map( image => this.productImagesRepository.create({ url: image }))
      })

      await this.productRepository.save(product);
      return { ...product, images }
    }catch(e){
      this.handleException(e)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try{
      const { limit, offset } = paginationDto;
      return await this.productRepository.find({take: limit, skip: offset});

    }catch(e){
      this.handleException(e);
    }
  }

  async findOne(term: string) {

    try{

      let product: Product
      
      if(IsUuid(term)){
        product = await this.productRepository.findOneBy({ id: term });        
      }else{
        const queryBuilder = this.productRepository.createQueryBuilder();
        product =  await queryBuilder.where(`UPPER(title) =:title or LOWER(slug) =:slug`, {title: term.toUpperCase(), slug: term.toLowerCase()}).getOne()  
      }

      if(!product)
      throw new NotFoundException(`Product with id: ${term} not found`)
      return product
      
    }catch(e: any){
      this.handleException(e)
    }
    
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({id, ...updateProductDto, images: [] })
    if(!product) throw new NotFoundException(`Product with id ${id} not found`)
    try{
      return await this.productRepository.save(product)
    }catch(e){
      this.handleException(e)
    }
  }

  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove(product);
  }

  private handleException(error: any){
    if(error.code === "23505")
      throw new BadRequestException(error.detail)

      this.logger.error(error)
      throw new InternalServerErrorException("Unexpected error, check logs")
  }
}
