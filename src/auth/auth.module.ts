import { Module } from '@nestjs/common';
import { APP_GAURD } from 'src/common/common.constants';
import { AuthGuard } from './auth.guard';

@Module({
    providers: [
        {
            provide: APP_GAURD,
            useClass: AuthGuard
        }
    ]
})
export class AuthModule {}
