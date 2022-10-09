import {Inject, UseGuards } from "@nestjs/common";
import { Args, Query, Mutation, Resolver, Subscription } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateMemoInput, CreateMemoOutput, DeleteMemoInput, DeleteMemoOutput, EditMemoInput, EditMemoOutput, SortMemoOutput, SortMemoInput, SearchMemoOutput, SearchMemoInput } from "./dtos/memo.dto";
import { CreateMemoGroupInput, CreateMemoGroupOutput, DeleteMemoGroupInput, DeleteMemoGroupOutput, EditMemoGroupInput, EditMemoGroupOutput } from "./dtos/memo-group.dto";
import { MyMemosInput, MyMemosOutput } from "./dtos/my-memos.dto";
import { MemoService } from "./memo.service";
import { AcceptGroupMemberInput, AcceptGroupMemberOutput, AcceptInvitationOutput, DeleteGroupMemberInput, DeleteGroupMemberOutput, InviteGroupMemberInput, InviteGroupMemberOutput, MyInvitationOutput } from "./dtos/memo-group-members";
import { ACCEPT_INVITATION, PUB_SUB } from "src/common/common.constants";
import { PubSub } from "graphql-subscriptions";
import { AddMemoTagInput, AddMemoTagOutput, AddTagsInput, AddTagsOutput } from "./dtos/tags.dto";

@Resolver()
export class MeomoResolver {
    constructor(
        @Inject(PUB_SUB) private readonly pubSub: PubSub,
        private readonly memoService: MemoService
    ) { }

    @Query(returns => MyMemosOutput)
    @UseGuards(AuthGuard)
    myMemos(
        @AuthUser() userData,
        @Args('input') myMemosInput: MyMemosInput
    ): Promise<MyMemosOutput> {
        return this.memoService.myMemos(userData, myMemosInput);
    }

    @Mutation(returns => CreateMemoGroupOutput)
    @UseGuards(AuthGuard)
    createMemoGroup(
        @AuthUser() userData,
        @Args('input') { title }: CreateMemoGroupInput
    ): Promise<CreateMemoGroupOutput> {
        return this.memoService.createMemoGroup(userData, title);
    }

    @Mutation(returns => CreateMemoOutput)
    @UseGuards(AuthGuard)
    createMemo(
        @AuthUser() userData,
        @Args('input') CreateMemoInput: CreateMemoInput
    ): Promise<CreateMemoOutput> {
        return this.memoService.createMemo(userData.id, CreateMemoInput);
    }

    @Mutation(returns => DeleteMemoGroupOutput)
    @UseGuards(AuthGuard)
    deleteMemoGroup(@Args('input') { id }: DeleteMemoGroupInput): Promise<DeleteMemoGroupOutput> {
        return this.memoService.deleteMemoGroup(id);
    }

    @Mutation(returns => DeleteMemoOutput)
    @UseGuards(AuthGuard)
    deleteMemo(@Args('input') { id }: DeleteMemoInput): Promise<DeleteMemoOutput> {
        return this.memoService.deleteMemo(id);
    }

    @Mutation(returns => EditMemoGroupOutput)
    @UseGuards(AuthGuard)
    editMemoGroup(
        @AuthUser() userData,
        @Args('input') editMemoGroupInput: EditMemoGroupInput
    ): Promise<EditMemoGroupOutput> {
        return this.memoService.editMemoGroup(userData.id, editMemoGroupInput);
    }

    @Mutation(returns => EditMemoOutput)
    @UseGuards(AuthGuard)
    editMemo(
        @AuthUser() userData,
        @Args('input') editMemoInput: EditMemoInput
    ): Promise<EditMemoOutput> {
        return this.memoService.editMemo(userData.id, editMemoInput);
    }

    @Mutation(returns => SortMemoOutput)
    @UseGuards(AuthGuard)
    sortMemo(@Args('input') sortMemoInput: SortMemoInput): Promise<SortMemoOutput> {
        return this.memoService.sortMemo(sortMemoInput);
    }

    @Mutation(returns => InviteGroupMemberOutput)
    @UseGuards(AuthGuard)
    inviteGroupMember(
        @Args('input') inviteGroupMemberInput: InviteGroupMemberInput
    ): Promise<InviteGroupMemberOutput> {
        return this.memoService.inviteGroupMember(inviteGroupMemberInput);
    }

    @Mutation(returns => AcceptGroupMemberOutput)
    @UseGuards(AuthGuard)
    acceptGroupMember(
        @Args('input') acceptGroupMemberInput: AcceptGroupMemberInput
    ): Promise<AcceptGroupMemberOutput> {
        return this.memoService.acceptGroupMember(acceptGroupMemberInput);
    }

    @Mutation(returns => DeleteGroupMemberOutput)
    @UseGuards(AuthGuard)
    deleteGroupMember(
        @Args('input') deleteGroupMemberInput: DeleteGroupMemberInput
    ): Promise<DeleteGroupMemberOutput> {
        return this.memoService.deleteGroupMember(deleteGroupMemberInput);
    }

    @Query(returns => MyInvitationOutput)
    @UseGuards(AuthGuard)
    myInvitation( @AuthUser() userData ): Promise<MyInvitationOutput> {
        return this.memoService.myInvitation(userData);
    }

    @UseGuards(AuthGuard)
    @Subscription(returns => AcceptInvitationOutput, {
        filter: ({invitation}, _, data) => {
            return invitation.userId === data.user.id;
        },
        resolve: (invitation) => invitation
    })
    acceptInvitation() {
        return this.pubSub.asyncIterator(ACCEPT_INVITATION);
    }

    /*
    * TAGS
    */
    @UseGuards(AuthGuard)
    @Mutation(returns => AddTagsOutput)
    addTags(@Args('input') addTagsInput: AddTagsInput): Promise<AddTagsOutput> {
        return this.memoService.addTags(addTagsInput);
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => AddMemoTagOutput)
    addMemoTags(@Args('input') addMemoTagInput: AddMemoTagInput): Promise<AddMemoTagOutput> {
        return this.memoService.addMemoTags(addMemoTagInput);
    }
}
