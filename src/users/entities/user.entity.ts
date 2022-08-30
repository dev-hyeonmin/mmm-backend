import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, UpdateDateColumn } from "typeorm";
import { MemoGroup } from "src/memo/entities/memo-group.entity";

@InputType("UserInputType", { isAbstract: true })
@ObjectType() // 자동으로 스키마를 빌드하기 위한 GraphQL의 decorator
@Entity() // TypeORM이 DB에 해당 정보 저장
export class User extends CoreEntity {
    @Column()
    @Field(type => String)
    name: string;
        
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

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            try {
                this.password = await bcrypt.hash(this.password, 10);
            } catch (error) {
                console.log(error);
                throw new InternalServerErrorException;
            }
        }
    }

    @OneToMany(
        () => MemoGroup,
        (memoGroup) => memoGroup.user,
        { onDelete: "CASCADE" }
    )
    memoGroup: MemoGroup[];
}