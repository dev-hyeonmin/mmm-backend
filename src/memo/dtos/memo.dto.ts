import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
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
export class DeleteMemoOutput extends CoreOutput {}