import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";
import { CoreEntity } from "src/common/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { MemoGroup } from "./memo-group.entity";

export enum UseType {
    Viewer = 'Viewer',
    Editor = 'Editor',
}
registerEnumType(UseType, { name: 'UseType' });

@InputType("MemoGroupMemberType", { isAbstract: true })
@ObjectType()
@Entity()
export class MemoGroupMembers {
    @Field(types => Number)
    @PrimaryColumn() 
    userId: number;

    @Field(types => User)
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

    @Field(types => MemoGroup)
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

    @Column({ type: 'enum', enum: UseType })
    @Field(type => UseType)
    @IsEnum(UseType)
    useType: UseType;
}