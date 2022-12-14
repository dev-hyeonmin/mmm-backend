import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemoGroupMembers } from "../entities/memo-group-members";

@InputType()
export class InviteGroupMemberInput extends PickType(MemoGroupMembers, [
    'groupId',
    'useType'
]){
    @Field(type => String)
    inviteEmail: string;
}

@ObjectType()
export class InviteGroupMemberOutput extends CoreOutput {}

@InputType()
export class AcceptGroupMemberInput extends PickType(MemoGroupMembers, [
    'groupId',
    'userId',
    'accept',    
]) { }

@ObjectType()
export class AcceptGroupMemberOutput extends CoreOutput { }

@ObjectType()
export class AcceptInvitationOutput {
    @Field(types => MemoGroupMembers)
    invitation: MemoGroupMembers;
}

@ObjectType()
export class MyInvitationOutput extends CoreOutput {
    @Field(types => [MemoGroupMembers], { nullable: true })
    invitations?: MemoGroupMembers[];
}

@InputType()
export class DeleteGroupMemberInput extends PickType(MemoGroupMembers, [
    'groupId',
    'userId'
]){}

@ObjectType()
export class DeleteGroupMemberOutput extends CoreOutput {}