import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { MemoGroupMembers } from "./memo-group-members";
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
        { onDelete: "CASCADE", eager: true, nullable: false },
    )
    memos?: Memo[];

    @Field(types => [MemoGroupMembers], { nullable: true })
    @OneToMany(
        () => MemoGroupMembers,
        (member) => member.group,
        { nullable: true }
    )
    members?: MemoGroupMembers[];
}