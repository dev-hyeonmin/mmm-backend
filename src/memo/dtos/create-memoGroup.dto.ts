import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemoGroup } from "../entities/memo-group.entity";

@InputType()
export class CreateMemoGroupInput extends PickType(MemoGroup, [
    'title'
]) { }

@ObjectType()
export class CreateMemoGroupOutput extends CoreOutput {}