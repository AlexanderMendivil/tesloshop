import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'rxjs';
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

  async findAll() {

    try{
      return await this.productRepository.find({});

    }catch(e){
      this.handleException(e);
    }
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if(!product)
      throw new NotFoundException(`Product with id: ${id} not found`)
      return product
    
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
