import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

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

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleException(error: any){
    if(error.code === "23505")
      throw new BadRequestException(error.detail)

      this.logger.error(error)
      throw new InternalServerErrorException("Unexpected error, check logs")
  }
}
