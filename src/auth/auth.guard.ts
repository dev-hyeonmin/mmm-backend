import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "src/jwt/jwt.service";
import { UserService } from "src/users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}
    
    async canActivate(context: ExecutionContext):Promise<any> {
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const token = gqlContext.token;

        if (token) { 
            try {
                const decoded = this.jwtService.verify(token.toString());
                if (!decoded.hasOwnProperty('id')) { return; }
                
                if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) { 
                    const { user } = await this.userService.findById(decoded['id']);
                    gqlContext.user = user;
                    return user;
                }
            } catch (error) {
                console.log(error);
            }
        }

        return false;
    }
}