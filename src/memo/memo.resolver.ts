import {Inject, UseGuards } from "@nestjs/common";
import { Args, Query, Mutation, Resolver, Subscription } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateMemoInput, CreateMemoOutput, DeleteMemoInput, DeleteMemoOutput, EditMemoInput, EditMemoOutput, SortMemoOutput, SortMemoInput, SearchMemoOutput, SearchMemoInput } from "./dtos/memo.dto";
import { CreateMemoGroupInput, CreateMemoGroupOutput, DeleteMemoGroupInput, DeleteMemoGroupOutput, EditMemoGroupInput, EditMemoGroupOutput } from "./dtos/memo-group.dto";
import { MyMemosInput, MyMemosOutput } from "./dtos/my-memos.dto";
import { MemoService } from "./memo.service";
import { AcceptGroupMemberInput, AcceptGroupMemberOutput, AcceptInvitationOutput, InviteGroupMemberInput, InviteGroupMemberOutput } from "./dtos/memo-group-members";
import { ACCEPT_INVITATION, PUB_SUB } from "src/common/common.constants";
import { PubSub } from "graphql-subscriptions";

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
        @Args('input') CreateMemoInput: CreateMemoInput
    ): Promise<CreateMemoOutput> {
        return this.memoService.createMemo(CreateMemoInput);
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
    editMemoGroup(@Args('input') editMemoGroupInput: EditMemoGroupInput): Promise<EditMemoGroupOutput> {
        return this.memoService.editMemoGroup(editMemoGroupInput);
    }

    @Mutation(returns => EditMemoOutput)
    @UseGuards(AuthGuard)
    editMemo(@Args('input') editMemoInput: EditMemoInput): Promise<EditMemoOutput> {
        return this.memoService.editMemo(editMemoInput);
    }

    @Mutation(returns => SortMemoOutput)
    @UseGuards(AuthGuard)
    sortMemo(@Args('input') sortMemoInput: SortMemoInput): Promise<SortMemoOutput> {
        return this.memoService.sortMemo(sortMemoInput);
    }

    @Mutation(returns => InviteGroupMemberOutput)
    @UseGuards(AuthGuard)
    inviteGroupMember(
        @AuthUser() userData,
        @Args('input') inviteGroupMemberInput: InviteGroupMemberInput
    ): Promise<InviteGroupMemberOutput> {
        return this.memoService.inviteGroupMember(userData.id, inviteGroupMemberInput);
    }

    @Mutation(returns => AcceptGroupMemberOutput)
    @UseGuards(AuthGuard)
    acceptGroupMember(
        @Args('input') acceptGroupMemberInput: AcceptGroupMemberInput
    ): Promise<AcceptGroupMemberOutput> {
        return this.memoService.acceptGroupMember(acceptGroupMemberInput);
    }

    @UseGuards(AuthGuard)
    @Subscription(returns => AcceptInvitationOutput, {
        filter: ({ invitation: { userId } }, _, data) => {
            //return userId === data.user.id;
            return true;
        },
        resolve: ({ invitation }) => invitation
    })
    acceptInvitation() {
        return this.pubSub.asyncIterator(ACCEPT_INVITATION);
    }
}