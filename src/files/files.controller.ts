import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileNamer, fileFilter } from './helpers';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
      throw new BadRequestException('Make sure that the file is an image')
    }
    return {fieldName: file.originalname};
  }
}
