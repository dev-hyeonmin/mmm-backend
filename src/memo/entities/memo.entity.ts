import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/core.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { MemoGroup } from "./memo-group.entity";
import { MemoTags } from "./memo-tags";
import { Tags } from "./tags";

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
    @Field(types => String, {nullable: true})
    color?: string;
        
    @RelationId((memo: Memo) => memo.group)
    groupId: number;
    
    @ManyToOne(() => MemoGroup, (memoGroup) => memoGroup.memos, { onDelete: 'CASCADE' })
    group: MemoGroup;

    @OneToMany(
        () => MemoTags,
        (tag) => tag.memo,
        { onDelete: "CASCADE" }
    )
    tags: Tags[];
}