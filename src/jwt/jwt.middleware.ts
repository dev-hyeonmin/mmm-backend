import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UserService } from "src/users/users.service";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(
        private readonly userService: UserService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        if ('x-jwt' in req.headers) {
            const token = req.headers['x-jwt'];
            try {
                const decoded = jwt.verify(token.toString(), "9FrpJBJGEmrQun4xQJQQA7DMOFgFtiJD");
                
                if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {                    
                    const { user } = await this.userService.findById(decoded['id']);        
                    req['user'] = user;
                }
            } catch (error) {
                return error;
            }
        }
        
        next();
    }
}
