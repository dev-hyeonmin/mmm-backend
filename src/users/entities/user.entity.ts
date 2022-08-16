import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { Column, Entity, UpdateDateColumn } from "typeorm";

@InputType("UserInputType", { isAbstract: true })
@ObjectType() // 자동으로 스키마를 빌드하기 위한 GraphQL의 decorator
@Entity() // TypeORM이 DB에 해당 정보 저장
export class User extends CoreEntity {
    @Column({ unique: true })
    @Field(type => String)
    email: string;

    @Column()
    @Field(type => String)
    password: string;

    @Column({ default: false })
    @Field(type => Boolean)
    verified: boolean;

    @UpdateDateColumn()
    @Field(type => Date)
    lastLogin: string;
}