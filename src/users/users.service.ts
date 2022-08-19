import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import * as jwt from 'jsonwebtoken';
import * as dayjs from "dayjs";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
    ) { }

    async findById(id: number): Promise<UserProfileOutput> {
        try {
            const user = await this.users.findOneOrFail({ where: { id } });
            if (!user) {
                return {ok: false, error: "User Not Found."}
            }

            return {ok: true, user};
        } catch (error) {
            return { ok: false, error };
        }
    }

    async createAccount({name, email, password}: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const isExists = await this.users.findOneBy({ email });
            if (isExists) {
                return {ok: false, error: "There is a user with that email already."}
            }

            const user = await this.users.save(this.users.create({ name, email, password }));            
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

            const token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), "id": user.id }, "9FrpJBJGEmrQun4xQJQQA7DMOFgFtiJD");
            return { ok: true, token: token };
        } catch (error) {
            throw { ok: false, error };
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