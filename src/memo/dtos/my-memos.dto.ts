import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemoGroup } from "../entities/memo-group.entity";

@InputType()
export class MyMemosInput {
    @Field(types => String, { nullable: true })
    keyword?: string;
}

@ObjectType()
export class MyMemosOutput extends CoreOutput {
    @Field(types => [MemoGroup], { nullable: true })
    groups?: MemoGroup[];
}