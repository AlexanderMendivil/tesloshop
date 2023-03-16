import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto/dto';
import { User } from './entities/user.entity';
import * as bcr from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
    
    ){

  }
  
  async createUser(createUserDto: CreateUserDto) {
    try{

      const {password, ...userData } = createUserDto;
      const user = this.userRepository.create( {...userData, password: bcr.hashSync( password, 10 ) } );
      await this.userRepository.save( user );
      delete user.password;
      return {...user, token: this.getJWT({ email: user.email })};
    }catch(e){
      this.handleError(e);
    }
  }

  async login(loginUserDto: LoginUserDto){
      const { password, email } = loginUserDto;
      const user = await this.userRepository.findOne( { 
        where: { email },
        select: { email: true, password: true } 
      }); 

      if(!user) 
      throw new UnauthorizedException('credentials are not valid');
      
      if(!bcr.compareSync( password, user.password )) 
      throw new UnauthorizedException('credentials are not valid');
      return {...user, token: this.getJWT({email: user.email})};

  }

  private getJWT( payload: JwtPayload ){
    return this.jwtService.sign( payload );
  }

   private handleError(error: any): never{
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    
    console.log(error)

    throw new InternalServerErrorException('Please check servers logs');

  }
}
