import { Controller, Post, Body, Get, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetUser, RawHeaders, Auth } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto, LoginUserDto  } from './dto/dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @GetUser('email') user: User,
    @RawHeaders() rawHeaders: string[]
    ){
    return {
      ok:true,
      user,
      rawHeaders
    }
  }

  @Get('private2')
  //@SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected( ValidRoles.superUser, ValidRoles.admin )
  @UseGuards(AuthGuard(), UserRoleGuard )
  privateRoute(@GetUser() user: User){
    return user;
  }

  @Get('private3')
  @Auth()
  privateRout3(@GetUser() user: User){
    return user;
  }
}
