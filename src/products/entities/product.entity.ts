import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
    
    @ApiProperty({
        example: 'a2e93311-06b5-4a42-8299-a64b3edef607',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ApiProperty(
        {
            example: 'T-shirt teslo',
            description: 'Product title',
            uniqueItems: true
        }
    )
    @Column('text', {
        unique: true,
    })
    title: string;
    
    @ApiProperty(
        {
            example: '0',
            description: 'Product price',
        }
    )
    @Column('float',{
        default: 0
    })
    price: number;
    
    @ApiProperty(
        {
            example: 'Ad commodo laborum do veniam reprehenderit Lorem aliquip incididunt. In minim exercitation exercitation commodo ad. Dolore ut ex culpa eu cillum velit quis sint.',
            description: 'Product description',
        }
    )
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;
    
    @ApiProperty(
        {
            example: 'T_shirt_teslo',
            description: 'Product slug',
            uniqueItems: true
        }
    )
    @Column('text', {
        unique: true
    })
    slug: string;
    
    @ApiProperty(
        {
            example: '10',
            description: 'Product stock',
            default: 0,
        }
    )
    @Column('int', {
        default: 0
    })
    stock: number;
    
    @ApiProperty(
        {
            example: '[S, M, L, XL]',
            description: 'Product sizes',
            default: [],
        }
    )
    @Column('text',{
        array: true
    })
    sizes: string[];
    
    @ApiProperty(
        {
            example: 'women',
            description: 'Product gender',
        }
    )
    @Column('text')
    gender: string;
    
    
    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];
    
    // images
    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];


    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User


    @BeforeInsert()
    checkSlugInsert() {

        if ( !this.slug ) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')

    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }


}