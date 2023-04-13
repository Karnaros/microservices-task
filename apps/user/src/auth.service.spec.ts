import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";
import * as bcrypt from 'bcryptjs';
import { JwtService } from "@nestjs/jwt";
import { RpcException } from "@nestjs/microservices";


describe('AuthService', () => {
    const testUser = {
        email: "email@mail.com",
        password: 'password',
    };
    const badUser = {
        ...testUser,
        password: "wrong password",
    }
    const token = 'some token string';

    let userService: UserService;
    let authService: AuthService;
    let sampleUser: object;

    let getUserByEmailMock = jest.fn(() => sampleUser);
    let signAsyncMock = jest.fn(() => token);

    beforeAll( async () => {
        sampleUser = {
            ...testUser,
            password: await bcrypt.hash(testUser.password, 10),
        };
    });

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: {
                        getUserByEmail: getUserByEmailMock,
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: signAsyncMock,
                    }
                }
            ],
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        userService = moduleRef.get<UserService>(UserService);
    });

    describe('When calling login method', () => {
        describe('with a valid user data', () => {
            it('should return an auth token', async () => {
                const result = await authService.loginUser(testUser);
                expect(result).toEqual({token});
                expect(getUserByEmailMock).toBeCalledWith(testUser.email);
                expect(signAsyncMock).toBeCalled();
            });
        });

        describe('with an incorrect email or password', () => {
            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await authService.loginUser(badUser);
                }).rejects.toThrow(RpcException);
                expect(getUserByEmailMock).toBeCalledWith(badUser.email);
            });;
        });
    });
})
