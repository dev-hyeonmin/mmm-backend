import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateMemoInput, CreateMemoOutput, DeleteMemoOutput, EditMemoInput, EditMemoOutput, RangeMemoInput, RangeMemoOutput } from "./dtos/memo.dto";
import { CreateMemoGroupOutput, DeleteMemoGroupOutput, EditMemoGroupInput, EditMemoGroupOutput } from "./dtos/memo-group.dto";
import { MyMemosOutput } from "./dtos/my-memos.dto";
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

    async myMemos(user: User): Promise<MyMemosOutput> {
        try {     
            const memos = await this.memoGroup.find({
                where: { 
                    user: {
                        id: user.id
                    }
                },
                order: {
                    id: "ASC",
                    memos: {
                        orderby: "ASC"
                    }
                }
            });
            
            return { ok: true, groups: memos };
        } catch (error) {
            return { ok: false, error };
        }
    }

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

    async deleteMemoGroup(id: number): Promise<DeleteMemoGroupOutput> {
        try {
            const group = await this.memoGroup.findOneBy({ id });
            if (!group) {
                return { ok: false, error: "Group Not Found." };
            }

            await this.memoGroup.delete(id);            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async deleteMemo(id: number): Promise<DeleteMemoOutput> {
        try {
            const memo = await this.memo.findOneBy({ id });
            if (!memo) {
                return { ok: false, error: "Memo Not Found." };
            }
            
            await this.memo.delete(id);            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async editMemoGroup({id, title}: EditMemoGroupInput): Promise<EditMemoGroupOutput> {
        try {
            const group = await this.memoGroup.findOneBy({ id });
            if (!group) {
                return { ok: false, error: "Group Not Found." };
            }

            if (title) {
                group.title = title;
            }
            
            await this.memoGroup.save(group);
            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async editMemo({id, content, orderby, groupId}: EditMemoInput): Promise<EditMemoOutput> {
        try {
            const group = await this.memoGroup.findOneBy({ id: groupId });
            const memo = await this.memo.findOneBy({ id });
            if (!memo) {
                return { ok: false, error: "Memo Not Found." };
            }
            
            if (content) {
                memo.content = content;    
            }

            if (orderby) {
                memo.orderby = orderby;    
            }

            if (groupId) {
                memo.group = group;
            }

            await this.memo.save(memo);     
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async rangeMemo({ memoIds }: RangeMemoInput): Promise<RangeMemoOutput> {
        try {
            const memos = [];
            memoIds.map((id, index) => {
                memos.push({
                    id,
                    orderby: index
                })
            });

            this.memo.save(memos);
            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }
}