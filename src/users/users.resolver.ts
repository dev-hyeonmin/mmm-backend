import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/user-edit.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./users.service";

@Resolver()
export class UsersResolver {
    constructor(
        private readonly userService: UserService
    ) {}
    
    @Query(returns => User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User) {
        return authUser;
    }
    
    @Mutation(resturns => CreateAccountOutput)
    createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        return this.userService.createAccount(createAccountInput);
    }

    @Mutation(returns => EditProfileOutput)
    @UseGuards(AuthGuard)
    editProfile(
        @AuthUser() authUser: User,
        @Args('input') editProfileInput: EditProfileInput
    ): Promise<EditProfileOutput> {
        return this.userService.editProfile(authUser.id, editProfileInput);
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        return this.userService.login(loginInput);
    }

    @Mutation(returns => VerifyEmailOutput)
    async verifyEmail (@Args('input') { code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
        return this.userService.verifyEmail(code);
    }
}