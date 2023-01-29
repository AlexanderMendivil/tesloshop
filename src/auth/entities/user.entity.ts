import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column('text',{
        unique: true
    })
    email: string;
    
    @Column('text')
    password: string;
    
    @Column('text')
    fullname: string;
    
    @Column('bool')
    isActive: boolean;
    
    @PrimaryColumn('text',{
        array: true,
        default: ['user']
    })
    role: string[];

}
