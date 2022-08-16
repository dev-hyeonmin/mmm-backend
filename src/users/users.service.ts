import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";

export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>
    ) { }

    async createAccount({email, password}: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const isExists = await this.users.findOneBy({ email });
            if (isExists) {
                return {ok: false, error: "There is a user with that email already."}
            }

            const user = await this.users.save(this.users.create({ email, password }));            
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }
}