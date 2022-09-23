import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import * as dayjs from "dayjs";
//import * as sgMail from "@sendgrid/mail";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { Injectable, Query } from "@nestjs/common";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/user-edit.dto";
import { Verification } from "./entities/verification.entity";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";
import { MailService } from "src/mail/mail.service";
import { UploadsController } from "src/uploads/uploads.controller";
import { UploadsService } from "src/uploads/uploads.service";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(Verification)
        private readonly verification: Repository<Verification>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly uploadsService: UploadsService
    ) { }

    async findById(id: number): Promise<UserProfileOutput> {
        try {
            const user = await this.users.findOneOrFail({ where: { id } });
            if (!user) {
                return {ok: false, error: "User Not Found."}
            }

            return {ok: true, user};
        } catch (error) {
            return {ok: false, error: "User Not Found."}
        }
    }

    async findByEmail(email: string): Promise<UserProfileOutput> {
        try {
            const user = await this.users.findOneBy({email});
            if (!user) {
                return {ok: false, error: "User Not Found."}
            }

            return {ok: true, user};
        } catch (error) {
            return {ok: false, error: "User Not Found."}
        }
    }

    async createAccount({name, email, password}: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const isExists = await this.users.findOneBy({ email });
            if (isExists) {
                return {ok: false, error: "There is a user with that email already."}
            }

            const user = await this.users.save(this.users.create({ name, email, password }));
            const verification = await this.verification.save(this.verification.create({ user }));
            
            this.mailService.send(email, verification.code);
            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async editProfile(id: number, {name, email, password, userImage}: EditProfileInput):Promise<EditProfileOutput> {
        try {
            const user = await this.users.findOneBy({ id });
            if (!user) {
                return { ok: false, error: "User not found." };
            }

            if (name) {
                user.name = name;
            }
            if (email) {
                user.email = email;
            }
            if (userImage) {
                if (user.userImage) {
                    await this.uploadsService.delete(user.userImage);
                }
                user.userImage = userImage;
            }
            if (password) {
                await this.users.update(user.id, {
                    password: password
                });
            }

            await this.users.update(user.id, {
                name: user.name,
                email: user.email,
                userImage: user.userImage
            });
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async login({ email, password }: LoginInput): Promise<LoginOutput> {
        try {            
            const user = await this.users.findOne({ where: { email }, select: ['id', 'password'] });
            if (!user) {
                return { ok: false, error: "User not found." };
            }

            const checkPassword = await bcrypt.compare(password, user.password);
            if (!checkPassword) {
                return { ok: false, error: 'Wrong password.' };
            }

            this.users.update(user.id, { "lastLogin": this.getNow() });
            const token = this.jwtService.sign(user.id);
            return { ok: true, token: token };
        } catch (error) {
            throw { ok: false, error };
        }
    }

    async verifyEmail(code: string): Promise<VerifyEmailOutput> {
        try {
            const verification = await this.verification.findOne({ where: {code}, relations: ['user'] });
            
            if (verification) {
                this.users.save({
                    id: verification.user.id,
                    verified: true
                });
                this.verification.delete(verification.id);
                return { ok: true };
            }

            return {
                ok: false,
                error: 'Verification not found.'
            };
        } catch (error) {
            return { ok: false, error };
        }        
    }

    private getNow(): string {
        return dayjs().format('YYYY-MM-DD HH:mm:ss');

        /*let today = new Date();

        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let date = today.getDate();
        let hours = today.getHours();
        let minutes = today.getMinutes();
        let seconds = today.getSeconds();

        return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}.00`;*/        
    }
}