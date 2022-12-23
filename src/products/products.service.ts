import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as IsUuid } from "uuid"
@Injectable()
export class ProductsService {


  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>){}

  private readonly logger = new Logger("ProductService")
  async create(createProductDto: CreateProductDto) {

    try{
      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product);
      return product
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

    const product = await this.productRepository.preload({id, ...updateProductDto })
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
