import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { MemoGroup } from "./memo-group.entity";

@InputType("MemoType", { isAbstract: true })
@ObjectType()
@Entity()
export class Memo extends CoreEntity {
    @Column()
    @Field(types => String)
    content: string;
    
    @Column({ default: 0 })
    @Field(types => Number)
    orderby: number;

    @Column({ default: "#FFFFFF" })
    @Field(types => String)
    color: string;
        
    @RelationId((memo: Memo) => memo.group)
    groupId: number;
    
    @ManyToOne(() => MemoGroup, (memoGroup) => memoGroup.memos, { onDelete: 'CASCADE' })
    group: MemoGroup;
}