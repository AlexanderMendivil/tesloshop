import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/crete-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>){

  }
  
  async createUser(createUserDto: CreateUserDto) {
    try{
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save( user );
      return user;
    }catch(e){
      this.handleError(e);
    }
  }

   private handleError(error: any): never{
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    
    console.log(error)

    throw new InternalServerErrorException('Please check servers logs');

  }
}
