import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemoGroup } from "../entities/memo-group.entity";

@InputType()
export class CreateMemoGroupInput extends PickType(MemoGroup, [
    'title'
]) { }

@ObjectType()
export class CreateMemoGroupOutput extends CoreOutput { }

@InputType()
export class DeleteMemoGroupInput extends PickType(MemoGroup, [
    'id'
]) { }

@ObjectType()
export class DeleteMemoGroupOutput extends CoreOutput { }

@InputType()
export class EditMemoGroupInput extends PickType(MemoGroup, [
    'id',
    'title'
]) { }

@ObjectType()
export class EditMemoGroupOutput extends CoreOutput { }