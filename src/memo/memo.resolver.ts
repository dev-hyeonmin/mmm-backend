import {UseGuards } from "@nestjs/common";
import { Args, Query, Mutation, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateMemoInput, CreateMemoOutput, DeleteMemoInput, DeleteMemoOutput, EditMemoInput, EditMemoOutput } from "./dtos/memo.dto";
import { CreateMemoGroupInput, CreateMemoGroupOutput, DeleteMemoGroupInput, DeleteMemoGroupOutput, EditMemoGroupInput, EditMemoGroupOutput } from "./dtos/memo-group.dto";
import { MyMemosOutput } from "./dtos/my-memos.dto";
import { MemoService } from "./memo.service";

@Resolver()
export class MeomoResolver {
    constructor(
        private readonly memoService: MemoService
    ) { }

    @Query(returns => MyMemosOutput)
    @UseGuards(AuthGuard)
    myMemos(@AuthUser() userData): Promise<MyMemosOutput> {
        return this.memoService.myMemos(userData);
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
    deleteMemoGroup({ id }: DeleteMemoGroupInput): Promise<DeleteMemoGroupOutput> {
        return this.memoService.deleteMemoGroup(id);
    }

    @Mutation(returns => DeleteMemoOutput)
    @UseGuards(AuthGuard)
    deleteMemo({ id }: DeleteMemoInput): Promise<DeleteMemoOutput> {
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
}