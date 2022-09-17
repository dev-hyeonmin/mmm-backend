import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { MemoGroup } from "./memo-group.entity";

@InputType("MemoGroupMemberType", { isAbstract: true })
@ObjectType()
@Entity()
export class MemoGroupMembers {
    @Field(types => Number)
    @PrimaryColumn() 
    userId: number;

    @ManyToOne(
        () => User,
        (user) => user.id,
        { onDelete: "CASCADE", eager: true},
    )
    @JoinColumn({ name: "userId" })
    user: User;

    @Field(types => Number)
    @PrimaryColumn()
    groupId: number;

    @ManyToOne(
        () => MemoGroup,
        (group) => group.members,
        { onDelete: "CASCADE", eager: true},
    )
    @JoinColumn({ name: "groupId" })
    group: MemoGroup;
           
           
    @Field(types => Boolean)
    @Column({default: false})
    accept: boolean;
}