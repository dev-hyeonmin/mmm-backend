import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemoTags } from "../entities/memo-tags";
import { Tags } from "../entities/tags";

@InputType()
export class AddTagsInput extends PickType(Tags, [
    'name',
    'groupId'
]) {}

@ObjectType()
export class AddTagsOutput extends CoreOutput {
    @Field(types => Number, { nullable: true })
    id?: number;
}

@InputType()
export class DeleteTagInput extends PickType(Tags, [
    'id'
]) {}

@ObjectType()
export class DeleteTagOutput extends CoreOutput { }

@InputType()
export class AddMemoTagInput extends PickType(MemoTags, [
    'memoId',
    'tagId'
]) {
    @Field(types => String)
    name: string;
}

@ObjectType()
export class AddMemoTagOutput extends CoreOutput { }

@InputType()
export class DeleteMemoTagInput extends PickType(MemoTags, [
    'memoId',
    'tagId'
]) {}

@ObjectType()
export class DeleteMemoTagOutput extends CoreOutput {}