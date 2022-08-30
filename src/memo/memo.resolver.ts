import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateMemoInput, CreateMemoOutput } from "./dtos/create-memo.dto";
import { CreateMemoGroupInput, CreateMemoGroupOutput } from "./dtos/create-memoGroup.dto";
import { MemoService } from "./memo.service";

@Resolver()
export class MeomoResolver {
    constructor(
        private readonly memoService: MemoService
    ) { }

    @Mutation(type => CreateMemoGroupOutput)
    @UseGuards(AuthGuard)
    createMemoGroup(
        @AuthUser() userData,
        @Args('input') { title }: CreateMemoGroupInput
    ): Promise<CreateMemoGroupOutput> {
        return this.memoService.createMemoGroup(userData, title);
    }

    @Mutation(type => CreateMemoOutput)
    @UseGuards(AuthGuard)
    createMemo(
        @Args('input') createMemoInput: CreateMemoInput
    ): Promise<CreateMemoOutput> {
        return this.memoService.createMemo(createMemoInput);
    }
}