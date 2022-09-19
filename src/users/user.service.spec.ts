import { UserService } from "./users.service";
import { Test } from "@nestjs/testing"
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import * as bcrypt from "bcrypt";
import { MailService } from "src/mail/mail.service";
import { Verification } from "./entities/verification.entity";

const mockRepository = () => ({    
    findOneOrFail: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
});

const mockJwtService = {
    sign: jest.fn(() => 'signed-token-baby'),
    verify: jest.fn()
}

const mockMailService = {
    send: jest.fn(),
}

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('User Service', () => {
    let usersRepository: MockRepository;
    let verificationRepository: MockRepository;
    let service: UserService;    
    let jwtService: JwtService;
    let mailService: MailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository()
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository()
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: MailService,
                    useValue: mockMailService
                }
            ],
        }).compile();
        service = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
        mailService = module.get<MailService>(MailService);
        usersRepository = module.get(getRepositoryToken(User));
        verificationRepository = module.get(getRepositoryToken(Verification));
    });

    it('be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findById', () => {
        const findByIdArgs = {
            id: 1
        };

        it('should find an existing user', async () => {
            usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
            const result = await service.findById(1);
            expect(result).toEqual({ ok: true, user: findByIdArgs });
        });

        it('should fail if no user if found', async () => {
            usersRepository.findOneOrFail.mockResolvedValue(null);
            const result = await service.findById(1);
            expect(result).toEqual({ok: false, error: "User Not Found."});
        });

        it('should fail on exception', async () => {
            usersRepository.findOneOrFail.mockRejectedValue(new Error());
            const result = await service.findById(1);
            expect(result.ok).toEqual(false);
        });
    });

    describe('createAccount', () => {
        const createAccountArgs = {
            name: "",
            email: "",
            password: ""
        }

        it('should fail if user exists', async () => {
            usersRepository.findOneBy.mockResolvedValue({id: 1});
            const result = await service.createAccount(createAccountArgs);
            expect(result).toEqual({ ok: false, error: "There is a user with that email already." });
        });

        it('should create a new user', async () => {
            usersRepository.findOneBy.mockResolvedValue(undefined);
            usersRepository.create.mockReturnValue(createAccountArgs);
            usersRepository.save.mockResolvedValue(createAccountArgs);
            verificationRepository.create.mockResolvedValue({token: "test"});
            verificationRepository.save.mockResolvedValue({token: "test"});
            const result = await service.createAccount(createAccountArgs);

            expect(usersRepository.create).toHaveBeenCalledTimes(1);
            expect(usersRepository.create).toBeCalledWith(createAccountArgs);
            expect(verificationRepository.create).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ ok: true });
        });

        it('should fail on exception', async () => {
            usersRepository.findOneBy.mockRejectedValue(new Error());
            const result = await service.createAccount(createAccountArgs);
            expect(result.ok).toEqual(false);
        });
    });

    describe('editProfile', () => {
        const editAccountArgs = {
            name: "",
            email: "",
            password: ""
        };

        it('should fail if user not exist', async () => {
            usersRepository.findOneOrFail.mockResolvedValue({id: 0});
            const result = await service.editProfile(0, editAccountArgs);
            expect(result).toEqual({ ok: false, error: 'User not found.' });
        });

        it('should change email and password', async () => {
            const editProfileArgs = {
                userId: 1,
                input: { name: 'after', email: 'after@gmail.com', password: "1111" }
            };

            const oldUser = {
                name: "before",
                email: "before@gmail.com",
                password: "0000"
            };

            usersRepository.findOneBy.mockResolvedValue(oldUser);
            usersRepository.create.mockReturnValue(editProfileArgs);
            usersRepository.save.mockReturnValue(editProfileArgs);

            await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
            expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOneBy).toHaveBeenCalledWith(
                {id: editProfileArgs.userId}
            );
        });

        it('should fail on exception', async () => {
            usersRepository.findOneBy.mockRejectedValue(new Error());
            const result = await service.editProfile(1, editAccountArgs);
            expect(result.ok).toEqual(false);
        });
    });

    describe('login', () => {
        const loginArgs = {
            email: "tester@gmail.com",
            password: "0000"
        };

        it('should fail if user not exist', async () => {
            usersRepository.findOne.mockResolvedValue(null);
            const result = await service.login(loginArgs);
            expect(result).toEqual({ ok: false, error: "User not found." });
        });

        it('should fail if the password is wrong', async () => {
            usersRepository.findOne.mockResolvedValue({ id: 1, password: "9999" });
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
            const result = await service.login(loginArgs);
            expect(result).toEqual({ ok: false, error: 'Wrong password.' });
        });

        it('should return token if password correct', async () => {
            usersRepository.findOne.mockResolvedValue({ id: 1, password: loginArgs.password });
            jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
            usersRepository.update.mockResolvedValue(1);
            const result = await service.login(loginArgs);

            expect(usersRepository.update).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
        });  
    });

    describe('verifyEmail', () => {
        it('should fail if the verification is not exist', async () => {
            verificationRepository.findOne.mockResolvedValue(null);
            const result = await service.verifyEmail("");
            expect(result).toEqual({ ok: false, error: 'Verification not found.' });
        });

        it('should verify email', async () => {
            const mockedVerification = {
                user: {
                    verified: false,
                },
                id: 1,
            };

            verificationRepository.findOne.mockResolvedValue(mockedVerification);
            const result = await service.verifyEmail("");

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

            expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
            expect(verificationRepository.delete).toHaveBeenCalledWith(
                mockedVerification.id,
            );

            expect(result.ok).toEqual(true);
        });
    });
})