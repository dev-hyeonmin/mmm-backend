import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemoGroup } from "../entities/memo-group.entity";

@ObjectType()
export class MyMemosOutput extends CoreOutput {
    @Field(types => [MemoGroup], { nullable: true })
    groups?: MemoGroup[];
}