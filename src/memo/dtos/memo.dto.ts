import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { number } from "joi";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Any } from "typeorm";
import { MemoGroup } from "../entities/memo-group.entity";
import { Memo } from "../entities/memo.entity";

@InputType()
export class CreateMemoInput extends PickType(Memo, [
    'content'
]) {
    @Field(types => Number)
    groupId: number;
}

@ObjectType()
export class CreateMemoOutput extends CoreOutput { }

@InputType()
export class DeleteMemoInput extends PickType(Memo, [
    'id'
]) { }

@ObjectType()
export class DeleteMemoOutput extends CoreOutput { }

@InputType()
export class EditMemoInput extends PickType(Memo, [
    'id',
]) {
    @Field(types => String, {nullable: true})
    content?: string;

    @Field(types => Number, {nullable: true})
    groupId?: number;

    @Field(types => Number, {nullable: true})
    orderby?: number;
}

@ObjectType()
export class EditMemoOutput extends CoreOutput { }


@InputType()
export class RangeMemoInput {
    @Field(types => [Number], { nullable: true })
    memoIds?: number[];
}

@ObjectType()
export class RangeMemoOutput extends CoreOutput {}