import { Test } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthService } from "./auth.service";
import { Roles } from "@app/common/roles.enum";
import { RpcException } from "@nestjs/microservices";

describe('UserController', () => {
    const testUser = {
        id: 1,
        email: "email@mail.com",
        password: 'password',
        role: Roles.USER
    };
    const testProfile = {
        id: 1,
        firstname: "John",
        lastname: "Doe",
        about: "something"
    };
    
    let userController: UserController;
    let userService: UserService;
    let authService: AuthService;
    let token = 'some token string';

    let getAllUsersMock: jest.SpyInstance;
    let getOneUserMock: jest.SpyInstance;
    let createUserMock: jest.SpyInstance;
    let deleteUserMock: jest.SpyInstance;
    let loginUserMock: jest.SpyInstance;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        getAllUsers: jest.fn(() => { return [testUser] }),
                        getOneUser: jest.fn(() => testUser),
                        createUser: jest.fn(() => testProfile),
                        deleteUser: jest.fn(),
                    },
                },
                {
                    provide: AuthService,
                    useValue: {
                        loginUser: jest.fn(() => ({token})),
                    },
                },
            ],
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        userService = moduleRef.get<UserService>(UserService);
        userController = moduleRef.get<UserController>(UserController);
        
        getAllUsersMock = jest.spyOn(userService, 'getAllUsers');
        getOneUserMock = jest.spyOn(userService, 'getOneUser');
        createUserMock = jest.spyOn(userService, 'createUser');
        deleteUserMock = jest.spyOn(userService, 'deleteUser');
        loginUserMock = jest.spyOn(authService, 'loginUser');
    });

    describe('When calling getAll method', () => {
        it('should return an array of users', async () => {
            const result = await userController.getAll();
            expect(result).toEqual([testUser]);
            expect(getAllUsersMock).toBeCalled();
        });
    });

    describe('When calling getOne method', () => {
        describe('with an existing id', () => {
            let existingId = 1;
            it('should return one user', async () => {
                const result = await userController.getOne(existingId);
                expect(result).toEqual(testUser);
                expect(getOneUserMock).toBeCalledWith(existingId);
            });
        });

        describe('with a non-existent id', () => {
            beforeEach(() => {
                getOneUserMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });
            let nonExistentId = 100;
            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userController.getOne(nonExistentId);
                }).rejects.toThrow(RpcException);
                expect(getOneUserMock).toBeCalledWith(nonExistentId);
            });      
        });
    });

    describe('When calling create method', () => {
        describe('with a valid user and profile data', () => {
            it('should return a created profile', async () => {
                const result = await userController.create(testUser, testProfile);
                expect(result).toEqual(testProfile);
                expect(createUserMock).toBeCalledWith(testUser, testProfile);
            });
        });

        describe('with a non-valid user or profile data', () => {
            beforeEach(() => {
                createUserMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userController.create(testUser, testProfile);
                }).rejects.toThrow(RpcException);
                expect(createUserMock).toBeCalledWith(testUser, testProfile);
            });
        });
    });

    describe('When calling login method', () => {
        describe('with a valid user data', () => {
            it('should return an auth token', async () => {
                const result = await userController.login(testUser);
                expect(result).toEqual({token});
                expect(loginUserMock).toBeCalledWith(testUser);
            });
        });

        describe('with an incorrect email or password', () => {
            beforeEach(() => {
                loginUserMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userController.login(testUser);
                }).rejects.toThrow(RpcException)
                expect(loginUserMock).toBeCalledWith(testUser);
            });;
        });
    });

    describe('When calling delete method', () => {
        describe('with an existing id', () => {
            let existingId = 1;
            it('should delete and return undefined', async () => {
                const result = await userController.delete(existingId);
                expect(result).toBeUndefined();
                expect(deleteUserMock).toBeCalledWith(existingId);
            });
        });

        describe('with a non-existent id', () => {
            beforeEach(() => {
                deleteUserMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });
            let nonExistentId = 100;
            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await userController.delete(nonExistentId);
                }).rejects.toThrow(RpcException);
                expect(deleteUserMock).toBeCalledWith(nonExistentId);
            });      
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
});
