import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from 'src/uploads/uploads.module';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UserService } from './users.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User, Verification]), UploadsModule],
    providers: [UsersResolver, UserService],
    exports: [UserService]
})
export class UsersModule { }