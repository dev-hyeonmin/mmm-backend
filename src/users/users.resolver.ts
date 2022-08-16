import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { UserService } from "./users.service";

@Resolver()
export class UsersResolver {
    constructor(
        private readonly userService: UserService
    ) { }
    
    @Query(returns => CreateAccountOutput)
    me() {
        return { ok: true };
    }
    
    @Mutation(resturns => CreateAccountOutput)
    createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        return this.userService.createAccount(createAccountInput);
    }
}