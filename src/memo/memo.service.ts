import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateMemoInput, CreateMemoOutput } from "./dtos/create-memo.dto";
import { CreateMemoGroupOutput } from "./dtos/create-memoGroup.dto";
import { MemoGroup } from "./entities/memo-group.entity";
import { Memo } from "./entities/memo.entity";

@Injectable()
export class MemoService {
    constructor(
        @InjectRepository(MemoGroup)
        private readonly memoGroup: Repository<MemoGroup>,        
        @InjectRepository(Memo)
        private readonly memo: Repository<Memo>
    ) { }

    async createMemoGroup(user: User, title: string): Promise<CreateMemoGroupOutput> {
        try {
            await this.memoGroup.save(this.memoGroup.create({ title, user }));
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async createMemo({content, groupId}: CreateMemoInput): Promise<CreateMemoOutput> {
        try {
            const group = await this.memoGroup.findOneBy({ id: groupId });
            if (!group) {
                return { ok: false, error: "Group Not Found." };
            }
            
            await this.memo.save(this.memo.create({ content, group}));
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }
}