import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UserService } from "src/users/users.service";
import * as jwt from "jsonwebtoken";
import { JwtService } from "./jwt.service";

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {   
        if ('x-jwt' in req.headers) {            
            const token = req.headers['x-jwt'];

            if (token) {
                try {
                    const decoded = this.jwtService.verify(token.toString());
                    if (!decoded.hasOwnProperty('id')) { return; }
                    
                    if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {                    
                        const { user } = await this.userService.findById(decoded['id']);
                        req['user'] = user;
                    } 
                } catch (error) {
                    console.log(error);
                }
            }
        }
        
        next();
    }
}