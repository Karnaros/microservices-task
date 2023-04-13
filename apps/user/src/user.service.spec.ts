import { getModelToken } from "@nestjs/sequelize";
import { User } from "./user.model";
import { UserService } from "./user.service";
import { Test } from "@nestjs/testing";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import * as bcrypt from 'bcryptjs';
import { Roles } from "@app/common/roles.enum";
import { CreateUserDto } from "./dto/create-user.dto";

describe('UserService', () => {
    const testUser = {
        email: "email@mail.com",
        password: 'password',
    };
    const testProfile = {
        firstname: "John",
        lastname: "Doe",
        about: "something"
    };

    let client: ClientProxy;
    let userService: UserService;
    let userRepository: typeof User;
    let sampleProfile = {
        ...testProfile,
        id: 1,
    };
    let sampleUser: object;

    let findAllMock: jest.SpyInstance;
    let findOneMock: jest.SpyInstance;
    let findByPkMock: jest.SpyInstance;
    let createMock: jest.SpyInstance;
    let sendMock: jest.SpyInstance;

    beforeAll( async () => {
        sampleUser = {
            ...testUser,
            id: 1,
            password: await bcrypt.hash(testUser.password, 10),
            role: Roles.USER,
            destroy: jest.fn(),
        };
    });

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(User),
                    useValue: {
                        findAll: jest.fn(() => { return [sampleUser] }),
                        findOne: jest.fn(() => sampleUser),
                        findByPk: jest.fn(() => sampleUser),
                        create: jest.fn(() => sampleUser),
                    },
                },
                {
                    provide: 'PROFILE_SERVICE',
                    useValue: {
                        send: jest.fn(() => sampleProfile),
                    }
                }
            ],
        }).compile();

        client = moduleRef.get<ClientProxy>('PROFILE_SERVICE');
        userService = moduleRef.get<UserService>(UserService);
        userRepository = moduleRef.get<typeof User>(getModelToken(User));

        findAllMock = jest.spyOn(userRepository, 'findAll');
        findOneMock = jest.spyOn(userRepository, 'findOne');
        findByPkMock = jest.spyOn(userRepository, 'findByPk');
        createMock = jest.spyOn(userRepository, 'create');
        sendMock = jest.spyOn(client, 'send');
    });

    describe('When calling getAllUsers method', () => {
        it('should return an array of users', async () => {
            const result = await userService.getAllUsers();
            expect(result).toEqual([sampleUser]);
            expect(findAllMock).toBeCalled();
        });
    });

    describe('When calling getOneUser method', () => {
        describe('with an existing id', () => {
            let existingId = 1;

            it('should return one user', async () => {
                const result = await userService.getOneUser(existingId);
                expect(result).toEqual(sampleUser);
                expect(findByPkMock).toBeCalledWith(existingId);
            });
        });

        describe('with a non-existent id', () => {
            beforeEach(() => {
                findByPkMock.mockImplementationOnce(() => null);
            });
            let nonExistentId = 100;

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userService.getOneUser(nonExistentId);
                }).rejects.toThrow(RpcException);
                expect(findByPkMock).toBeCalledWith(nonExistentId);
            });      
        });
    });

    describe('When calling getUserByEmail method', () => {
        describe('with an existing email', () => {
            it('should return one user', async () => {
                const result = await userService.getUserByEmail(testUser.email);
                expect(result).toEqual(sampleUser);
                expect(findOneMock).toBeCalledWith({where: {email: testUser.email}});
            });
        });

        describe('with a non-existent email', () => {
            beforeEach(() => {
                findOneMock.mockImplementationOnce(() => null);
            });

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userService.getUserByEmail(testUser.email);
                }).rejects.toThrow(RpcException)
                expect(findOneMock).toBeCalledWith({where: {email: testUser.email}});
            });;
        });
    });

    describe('When calling createUser method', () => {
        describe('with a valid user and profile data', () => {
            beforeEach(() => {
                findOneMock.mockImplementationOnce(() => null);
            });

            it('should return a created profile', async () => {
                const result = await userService.createUser(testUser, testProfile);
                expect(result).toEqual(sampleProfile);
                expect(sendMock).toBeCalled();
            });
        });

        describe('with an existing email', () => {
            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userService.createUser(testUser, testProfile);
                }).rejects.toThrow(RpcException);
            });
        });

        describe('with a non-valid profile data', () => {
            beforeEach(() => {
                findOneMock.mockImplementationOnce(() => null);
                sendMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userService.createUser(testUser, testProfile);
                }).rejects.toThrow(RpcException);
                expect(sendMock).toBeCalled();
            });
        });
    });

    describe('When calling delete method', () => {
        describe('with an existing id', () => {
            let existingId = 1;
            it('should delete user and return undefined', async () => {
                const result = await userService.deleteUser(existingId);
                expect(result).toBeUndefined();
            });
        });

        describe('with a non-existent id', () => {
            beforeEach(() => {
                findByPkMock.mockImplementationOnce(() => null);
            });

            let nonExistentId = 100;
            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userService.deleteUser(nonExistentId);
                }).rejects.toThrow(RpcException);
            });      
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
});
