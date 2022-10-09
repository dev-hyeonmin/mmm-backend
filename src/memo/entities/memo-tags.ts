import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { Memo } from "./memo.entity";
import { Tags } from "./tags";

@InputType("MemoTagsType", { isAbstract: true })
@ObjectType()
@Entity()
export class MemoTags {
    @Field(types => Number)
    @PrimaryColumn() 
    memoId: number;

    @Field(types => Memo)
    @ManyToOne(
        () => Memo,
        (memo) => memo.tags,
        { onDelete: "CASCADE"},
    )
    memo: Memo;

    @Field(types => Number)
    @PrimaryColumn()
    tagId: number;

    @Field(types => Tags)
    @ManyToOne(
        () => Tags,
        (tag) => tag.tags,
        { onDelete: "CASCADE", eager: true},
    )
    tag: Tags;
}