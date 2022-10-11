import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemoGroup } from "../entities/memo-group.entity";
import { Memo } from "../entities/memo.entity";

@InputType()
export class MemoInput extends PickType(Memo, [
    'id'
]) {}

@ObjectType()
export class MemoOutput extends CoreOutput {
    @Field(types => Memo, { nullable: true })
    memo?: Memo;
}

@InputType()
export class CreateMemoInput extends PickType(Memo, [
    'content'
]) {
    @Field(types => Number)
    groupId: number;
}

@ObjectType()
export class CreateMemoOutput extends CoreOutput {
    @Field(types => Number, { nullable: true })
    id?: number;
}

@InputType()
export class DeleteMemoInput extends PickType(Memo, [
    'id'
]) { }

@ObjectType()
export class DeleteMemoOutput extends CoreOutput { }

@InputType()
export class EditMemoInput extends PickType(PartialType(Memo), [
    'id',
    'content',
    'orderby',
    'color'
]) {
    @Field(types => Number, {nullable: true})
    groupId?: number;
}

@ObjectType()
export class EditMemoOutput extends CoreOutput { }


@InputType()
export class SortMemoInput {
    @Field(types => [Memo], { nullable: true })
    memos?: Memo[];
}

@ObjectType()
export class SortMemoOutput extends CoreOutput { }

@InputType()
export class SearchMemoInput {
    @Field(types => String)
    keyword: string;
}

@ObjectType()
export class SearchMemoOutput extends CoreOutput {
    @Field(types => [MemoGroup], { nullable: true })
    memos?: MemoGroup[]; 
}