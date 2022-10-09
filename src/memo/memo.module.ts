import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MemoGroupMembers } from './entities/memo-group-members';
import { MemoGroup } from './entities/memo-group.entity';
import { MemoTags } from './entities/memo-tags';
import { Memo } from './entities/memo.entity';
import { Tags } from './entities/tags';
import { MeomoResolver } from './memo.resolver';
import { MemoService } from './memo.service';

@Module({
    imports: [TypeOrmModule.forFeature([MemoGroup, Memo, MemoGroupMembers, Tags, MemoTags])],
    providers: [MeomoResolver, MemoService],
    exports: [MemoService]
})
export class MemoModule {}