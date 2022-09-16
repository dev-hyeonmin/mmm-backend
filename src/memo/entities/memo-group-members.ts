import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { MemoGroup } from "./memo-group.entity";

@InputType("MemoGroupMemberType", { isAbstract: true })
@ObjectType()
@Entity()
export class MemoGroupMembers extends CoreEntity{
    
    @RelationId((members: MemoGroupMembers) => members.group)
    groupId: number;

    @Field(types => MemoGroup)
    @ManyToOne(
        () => MemoGroup,
        (group) => group.members,
        { onDelete: "CASCADE", eager: true},
    )
    group: MemoGroup;

    
    @RelationId((members: MemoGroupMembers) => members.user)
    userId: number;

    @Field(types => User)
    @ManyToOne(
        () => User,
        (user) => user.id,
        { onDelete: "CASCADE", eager: true},
    )
    user?: User;

    @Field(types => Boolean)
    @Column({default: false})
    accept: boolean;
}