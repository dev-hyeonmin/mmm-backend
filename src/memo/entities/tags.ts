import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { MemoGroup } from "./memo-group.entity";
import { MemoTags } from "./memo-tags";


@InputType("TagsType", { isAbstract: true })
@ObjectType()
@Entity()
export class Tags {
    @PrimaryGeneratedColumn()
    @Column(type => Number)
    @Field(type => Number) 
    id: number;

    @RelationId((memo: Tags) => memo.group)
    @Column(type => Number)
    @Field(type => Number) 
    groupId: number;
    
    @ManyToOne(() => MemoGroup, (memoGroup) => memoGroup.tags, { onDelete: 'CASCADE' })
    group: MemoGroup;

    @Column()
    @Field(type => String)
    name: string;

    @OneToMany(
        () => MemoTags,
        (tag) => tag.tag,
        { onDelete: "CASCADE" }
    )
    tags: Tags[];
}