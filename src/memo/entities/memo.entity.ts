import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { MemoGroup } from "./memo-group.entity";

@InputType("MemoType", { isAbstract: true })
@ObjectType()
@Entity()
export class Memo extends CoreEntity {
    @Column()
    @Field(types => String)
    content: string;

    @RelationId((memo: Memo) => memo.group)
    groupId: number;
    
    @ManyToOne(() => MemoGroup, (memoGroup) => memoGroup.memos)
    group: MemoGroup;
}