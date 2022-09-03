import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly option: JwtModuleOptions
    ) { }
    sign(id: number): string {
        return jwt.sign({ "id": id }, this.option.privateKey);
    }
    verify(token: string) {
        if (!token) return null;
        return jwt.verify(token, this.option.privateKey);
    }
}