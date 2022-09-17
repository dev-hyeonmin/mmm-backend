import { Module } from '@nestjs/common';
import { APP_GAURD } from 'src/common/common.constants';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
    imports: [UsersModule],
    providers: [
        {
            provide: APP_GAURD,
            useClass: AuthGuard
        },
    ],
})
export class AuthModule { }