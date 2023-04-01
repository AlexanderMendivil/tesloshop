import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, MinLength } from "class-validator";

export class CreateProductDto {


    @ApiProperty({
        description: 'Product title',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty(
        {
            description: 'Product price',
            nullable: true,
        }
    )
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;
    
    @ApiProperty(
        {
            description: 'Product description',
            nullable: true,
        }
    )
    @IsString()
    @IsOptional()
    description?: string; 
    
    @ApiProperty(
        {
            description: 'Product slug',
            nullable: true,
        }
    )
    @IsString()
    @IsOptional()
    slug?: string;
    
    @ApiProperty(
        {
            description: 'Product stock',
            nullable: true,
        }
    )
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;
    
    @ApiProperty(
        {
            description: 'Product sizes',
            nullable: true,
        }
    )
    @IsArray()
    @IsString({each: true})
    sizes: string[];
    
    @ApiProperty(
        {
            description: 'Product gender',
            nullable: true,
        }
    )
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;
    
    @ApiProperty(
        {
            description: 'Product tags',
            nullable: true,
        }
    )
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags?: string[];
    
    @ApiProperty(
        {
            description: 'Product images',
            nullable: true,
        }
    )
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[];
}
