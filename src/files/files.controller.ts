import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { Res, UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileNamer, fileFilter } from './helpers';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService, private readonly configService: ConfigService) {}

  @Get('product/:imageName')
  findProductImage(
    @Param('imageName') imageName: string,
    @Res() res: Response,
    ){
    const path = this.filesService.getStaticProductImage( imageName );

    res.sendFile( path );
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileNamer 
    })
  }) )
  uploadProductImage( @UploadedFile() file: Express.Multer.File ) {

    if(!file){
      throw new BadRequestException('Make sure that the file is an image');
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${ file.filename }`;
    return { secureUrl };
  }
}
