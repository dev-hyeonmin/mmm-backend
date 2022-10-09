import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Brackets, Repository } from "typeorm";
import { CreateMemoInput, CreateMemoOutput, DeleteMemoOutput, EditMemoInput, EditMemoOutput, SortMemoInput, SortMemoOutput } from "./dtos/memo.dto";
import { CreateMemoGroupOutput, DeleteMemoGroupOutput, EditMemoGroupInput, EditMemoGroupOutput } from "./dtos/memo-group.dto";
import { MyMemosInput, MyMemosOutput } from "./dtos/my-memos.dto";
import { MemoGroup } from "./entities/memo-group.entity";
import { Memo } from "./entities/memo.entity";
import { MemoGroupMembers, UseType } from "./entities/memo-group-members";
import { AcceptGroupMemberInput, AcceptGroupMemberOutput, DeleteGroupMemberInput, DeleteGroupMemberOutput, InviteGroupMemberInput, InviteGroupMemberOutput, MyInvitationOutput } from "./dtos/memo-group-members";
import { ACCEPT_INVITATION, PUB_SUB } from "src/common/common.constants";
import { PubSub } from "graphql-subscriptions";
import { UserService } from "src/users/users.service";
import { AddMemoTagInput, AddMemoTagOutput, AddTagsInput, AddTagsOutput, DeleteMemoTagInput, DeleteMemoTagOutput, DeleteTagInput, DeleteTagOutput } from "./dtos/tags.dto";
import { MemoTags } from "./entities/memo-tags";
import { Tags } from "./entities/tags";

@Injectable()
export class MemoService {
    constructor(
        @InjectRepository(MemoGroup)
        private readonly memoGroup: Repository<MemoGroup>,        
        @InjectRepository(Memo)
        private readonly memo: Repository<Memo>,
        @InjectRepository(MemoGroupMembers)
        private readonly memoGroupMembers: Repository<MemoGroupMembers>,
        @InjectRepository(Tags)
        private readonly tags: Repository<Tags>,
        @InjectRepository(MemoTags)
        private readonly memoTags: Repository<MemoTags>,
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub,
        private readonly userService: UserService
    ) { }

    async myMemos(user: User, { keyword }: MyMemosInput): Promise<MyMemosOutput> {
        try {
            let groups = await this.memoGroup.createQueryBuilder("memoGroup")
                .leftJoinAndSelect("memoGroup.memos", "memos", "memos.content LIKE :keyword", { keyword: `%${keyword}%` })
                .leftJoinAndSelect("memos.tags", "tags")
                .leftJoinAndSelect("tags.tag", "tag")
                .leftJoinAndSelect("memoGroup.user", "user")
                .leftJoinAndSelect("memoGroup.members", "members", "members.accept = true")
                .leftJoinAndSelect("members.user", "membersName")
                .where("user.id = (:id) OR members.userId = :id", { id: user.id })
                .orderBy({
                    "memoGroup.id": "ASC",
                    "memos.orderby": "ASC",
                    "memos.id": "DESC",
                })
                .getMany();
            
            await Promise.all( groups.map(async (group) => {
                group.members = await
                        this.memoGroupMembers.createQueryBuilder("memoGroupMembers")
                        .leftJoinAndSelect("memoGroupMembers.user", "membersName")
                        .where("memoGroupMembers.groupId = (:id)", { id: group.id })
                        .andWhere("memoGroupMembers.accept = true")
                        .getMany();
            }));
            
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

    async createMemo(userId: number, {content, groupId}: CreateMemoInput): Promise<CreateMemoOutput> {
        try {
            const checkPermission = await this.checkPermission(groupId, userId);
            if (!checkPermission) {
                return { ok: false, error: "Permission denied." };
            }

            const group = await this.memoGroup.findOneBy({ id: groupId });
            if (!group) {
                return { ok: false, error: "Group Not Found." };
            }
            
            const memo = await this.memo.save(this.memo.create({content, group}));
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

    async editMemoGroup(userId: number, {id, title}: EditMemoGroupInput): Promise<EditMemoGroupOutput> {
        try {
            const checkPermission = await this.checkPermission(id, userId);
            if (!checkPermission) {
                return { ok: false, error: "Permission denied." };
            }

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

    async editMemo(userId: number, {id, content, orderby, groupId, color}: EditMemoInput): Promise<EditMemoOutput> {
        try {
            if (!id) {
                return { ok: false, error: "id is required." };
            }
            
            const memo = await this.memo.findOneBy({ id });
            if (!memo) {
                return { ok: false, error: "Memo Not Found." };
            }

            const checkPermission = await this.checkPermission(memo.groupId, userId);
            if (!checkPermission) {
                return { ok: false, error: "Permission denied." };
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

    async inviteGroupMember({ groupId, inviteEmail, useType }: InviteGroupMemberInput): Promise<InviteGroupMemberOutput> {
        try {            
            const invitedUser = await this.userService.findByEmail(inviteEmail);
            if (!invitedUser.user) {
                return { ok: false, error: "User Not Found." };
            }

            const group = await this.memoGroup.findOne({
                where: {
                    id: groupId
                }
            });

            const hasInvitation = await this.memoGroupMembers.findOne({
                where: {
                    groupId,
                    userId: invitedUser.user.id,                    
                }
            })

            if (hasInvitation) {
                return { ok: false, error: "Already Invited." };
            }

            const invitation = await this.memoGroupMembers.save(this.memoGroupMembers.create({ group, user: invitedUser.user, useType }));
            await this.pubSub.publish(ACCEPT_INVITATION, {
                invitation : invitation
            });

            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async myInvitation({ id }: User): Promise<MyInvitationOutput> {
        try {
            const invitations = await this.memoGroupMembers.find({
                relations: ['group.user'],
                where: {
                    userId: id,
                    accept: false
                }
            });

            return { ok: true, invitations };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async acceptGroupMember({ groupId, userId, accept }: AcceptGroupMemberInput): Promise<AcceptGroupMemberOutput> {
        try {
            const invitation = await this.memoGroupMembers.findOneBy({ groupId, userId });
            if (!invitation) {
                return { ok: false, error: "Invite member Not Found." };
            }

            if (accept) {
                invitation.accept = accept;
                await this.memoGroupMembers.save(invitation);
            } else {
                await this.memoGroupMembers.delete({ userId, groupId });
            }

            await this.pubSub.publish(ACCEPT_INVITATION, {
                invitation : invitation
            });
            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async deleteGroupMember({ groupId, userId }: DeleteGroupMemberInput): Promise<DeleteGroupMemberOutput> {
        try {
            const invitation = await this.memoGroupMembers.findOneBy({ groupId, userId });
            if (!invitation) {
                return { ok: false, error: "Invite member Not Found." };
            }

            await this.memoGroupMembers.delete({ groupId, userId });
            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async checkPermission(groupId: number, userId: number):Promise<Boolean> {
        try {
            let group = await this.memoGroup.createQueryBuilder("memoGroup")
                .leftJoinAndSelect("memoGroup.user", "user")
                .leftJoinAndSelect("memoGroup.members", "members")
                .leftJoinAndSelect("members.user", "membersName")
                .where("memoGroup.id = (:id)", { id: groupId})
                .getOne();
            
            if (group.user.id === userId) {
                return true;
            } else {
                const memberInfo = group.members.find((member) => member.user.id === userId);
                if (memberInfo.useType === UseType.Editor) {                
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /*
    * TAGS
    */
    async addTags({groupId, name}: AddTagsInput): Promise<AddTagsOutput> {
        try {
            const group = await this.memoGroup.findOneBy({ id: groupId });
            if (!group) {
                return {ok: false, error: "Group not found."}
            }

            const tag = await this.tags.findOne({where: {groupId, name}});
            if (tag) {
                return {ok: false, error: "Tag already exist."}
            }

            const newTag = await this.tags.save(this.tags.create({ group, name }));

            return { ok: true, id: newTag.id };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async deleteTags({ id }: DeleteTagInput): Promise<DeleteTagOutput> {        
        try {
            await this.tags.delete({ id });

            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async addMemoTags({memoId, tagId, name}: AddMemoTagInput): Promise<AddMemoTagOutput> {
        try {
            const memoGroup = await this.memo.findOneBy({ id: memoId });
            const groupId = memoGroup.groupId;
            const tagId = (await this.addTags({ groupId, name })).id;

            const tag = await this.memoTags.findOneBy({ memoId, tagId });
            if (tag) {
                return {ok: false, error: "Already exist."}
            }

            await this.memoTags.save(this.memoTags.create({ memoId, tagId }));

            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async deleteMemoTags({memoId, tagId}: DeleteMemoTagInput): Promise<DeleteMemoTagOutput> {
        try {
            await this.memoTags.delete({ memoId, tagId });

            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }
}