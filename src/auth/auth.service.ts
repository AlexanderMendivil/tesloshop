import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/crete-user.dto';
import { User } from './entities/user.entity';
import * as bcr from 'bcrypt';

@Injectable()
export class AuthService {
  
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>){

  }
  
  async createUser(createUserDto: CreateUserDto) {
    try{

      const {password, ...userData } = createUserDto;
      const user = this.userRepository.create( {...userData, password: bcr.hashSync( password, 10 ) } );
      await this.userRepository.save( user );
      delete user.password;
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
