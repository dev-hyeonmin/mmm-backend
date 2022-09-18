import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Brackets, Repository } from "typeorm";
import { CreateMemoInput, CreateMemoOutput, DeleteMemoOutput, EditMemoInput, EditMemoOutput, SearchMemoInput, SearchMemoOutput, SortMemoInput, SortMemoOutput } from "./dtos/memo.dto";
import { CreateMemoGroupOutput, DeleteMemoGroupOutput, EditMemoGroupInput, EditMemoGroupOutput } from "./dtos/memo-group.dto";
import { MyMemosInput, MyMemosOutput } from "./dtos/my-memos.dto";
import { MemoGroup } from "./entities/memo-group.entity";
import { Memo } from "./entities/memo.entity";
import { MemoGroupMembers } from "./entities/memo-group-members";
import { AcceptGroupMemberInput, AcceptGroupMemberOutput, InviteGroupMemberInput, InviteGroupMemberOutput } from "./dtos/memo-group-members";
import { ACCEPT_INVITATION, PUB_SUB } from "src/common/common.constants";
import { PubSub } from "graphql-subscriptions";
import { UserService } from "src/users/users.service";

@Injectable()
export class MemoService {
    constructor(
        @InjectRepository(MemoGroup)
        private readonly memoGroup: Repository<MemoGroup>,        
        @InjectRepository(Memo)
        private readonly memo: Repository<Memo>,
        @InjectRepository(MemoGroupMembers)
        private readonly memoGroupMembers: Repository<MemoGroupMembers>,
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub,
        private readonly userService: UserService
    ) { }

    async myMemos(user: User, { keyword }: MyMemosInput): Promise<MyMemosOutput> {
        try {
            let groups = await this.memoGroup.createQueryBuilder("memoGroup")
                .leftJoinAndSelect("memoGroup.memos", "memos")
                .leftJoinAndSelect("memoGroup.members", "members")
                .where("memoGroup.userId = (:id)", { id: user.id })
                .orWhere(new Brackets(qb => {
                    qb.where("members.userId = (:id) AND members.accept = true", { id: user.id })
                }))
                .andWhere(new Brackets(qb => {
                    qb.where("memos.content LIKE (:keyword)", { keyword: `%${keyword}%` })
                }))
                .orderBy("memos.orderby", "ASC")
                .orderBy("memos.id", "DESC")
                .orderBy("memoGroup.id", "ASC")
                .getMany();
            return { ok: true, groups };
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
            
            const memo = await this.memo.save(this.memo.create({ content, group}));
            return { ok: true, id: memo.id };
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

            if (!title) {
                return { ok: false, error: "Title Not Found." };
            } 
            
            group.title = title;
            await this.memoGroup.save(group);
            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async editMemo({id, content, orderby, groupId, color}: EditMemoInput): Promise<EditMemoOutput> {
        try {
            if (!id) {
                return { ok: false, error: "id is required." };
            }
            
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

            if (color) {
                memo.color = color;    
            }
            
            if (groupId) {
                const group = await this.memoGroup.findOneBy({ id: groupId });
                memo.group = group;
            }

            await this.memo.save(memo);     
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async sortMemo({ memos }: SortMemoInput): Promise<SortMemoOutput> {
        try {
            this.memo.save(memos);
            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async inviteGroupMember(userId: number, { groupId, inviteEmail }: InviteGroupMemberInput): Promise<InviteGroupMemberOutput> {
        try {            
            const invitedUser = await this.userService.findByEmail(inviteEmail);
            if (!invitedUser.user) { return; }

            const group = await this.memoGroup.findOne({
                where: {
                    id: groupId
                }
            });

            const hasInvitation = await this.memoGroupMembers.findOne({
                where: {
                    groupId,
                    userId: invitedUser.user.id
                }
            })

            if (hasInvitation) {
                return { ok: false, error: "Already Invited." };
            }

            const invitation = await this.memoGroupMembers.save(this.memoGroupMembers.create({ group, user: invitedUser.user }));
            await this.pubSub.publish(ACCEPT_INVITATION, {
                invitation: {
                    groupId: invitation.groupId,
                    userId: invitation.userId,
                    groupTitle: group.title
                }
            });

            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async acceptGroupMember({ groupId, userId }: AcceptGroupMemberInput): Promise<AcceptGroupMemberOutput> {
        try {
            const member = await this.memoGroupMembers.findOneBy({ groupId, userId });
            if (!member) {
                return { ok: false, error: "Invite member Not Found." };
            }

            member.accept = true;
            await this.memoGroupMembers.save(member);
            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }
}