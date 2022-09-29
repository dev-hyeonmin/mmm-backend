import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@InputType()
@ObjectType()
export class CoreEntity {
    @PrimaryGeneratedColumn()
    @Column(type => Number)
    @Field(type => Number) 
    id: number;

    @CreateDateColumn()
    @Column(type => Date)
    createAt: Date;

    @UpdateDateColumn()
    @Column(type => Date)
    @Field(type => Date)
    updateAt: Date;
}