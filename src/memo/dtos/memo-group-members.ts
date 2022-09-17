import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemoGroupMembers } from "../entities/memo-group-members";

@InputType()
export class InviteGroupMemberInput {
    @Field(type => Number)
    groupId: number;

    @Field(type => String)
    inviteEmail: string;
}

@ObjectType()
export class InviteGroupMemberOutput extends CoreOutput { }

@InputType()
export class AcceptGroupMemberInput extends PickType(MemoGroupMembers, [
    'groupId',
    'userId'
]) { }

@ObjectType()
export class AcceptGroupMemberOutput extends CoreOutput { }