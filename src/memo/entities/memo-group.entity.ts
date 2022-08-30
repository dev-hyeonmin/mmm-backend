import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Memo } from "./memo.entity";

@InputType("MemoGroupType", { isAbstract: true })
@ObjectType()
@Entity()
export class MemoGroup extends CoreEntity {
    @Column()
    @Field(types => String)
    title: string;    
        
    @Field(types => User)
    @ManyToOne(types => User, user => user.memoGroup, { onDelete: 'CASCADE' })
    user: User;

    @Field(types => [Memo], { nullable: true })
    @OneToMany(
        () => Memo,
        (memo) => memo.group,
        { onDelete: "CASCADE", eager: true }
    )    
    memos?: Memo[];
}