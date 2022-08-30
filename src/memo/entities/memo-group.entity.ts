import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Memo } from "./memo.entity";

@InputType("MemoGroupType", { isAbstract: true })
@ObjectType()
@Entity()
export class MemoGroup extends CoreEntity {
    @Column()
    @Field(types => String)
    title: string;

    @ManyToOne(() => User, (user) => user.memoGroup)
    user: User;

    @OneToMany(() => Memo, (memo) => memo.group)
    memeos: Memo[];
}