import { Test } from "@nestjs/testing";
import { Profile } from "./profile.model";
import { ProfileService } from "./profile.service";
import { getModelToken } from "@nestjs/sequelize";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Observable } from "rxjs";

describe('ProfileService', () => {
    const testProfile = {
        id: 1,
        firstname: "John",
        middlename: null,
        lastname: "Doe",
        about: "something",
        phoneNumber: null,
    };
    const sampleProfile = {
        ...testProfile,
        destroy: jest.fn(),
        save: jest.fn(),
    };

    let profileService: ProfileService;
    let profileRepository: typeof Profile;
    let client: ClientProxy;

    let findAllMock: jest.SpyInstance;
    let findByPkMock: jest.SpyInstance;
    let createMock: jest.SpyInstance;
    let sendMock: jest.SpyInstance;
    let destroyMock = jest.spyOn(sampleProfile, 'destroy');
    let saveMock = jest.spyOn(sampleProfile, 'save');

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: getModelToken(Profile),
                    useValue: {
                        findAll: jest.fn(() => {return [sampleProfile]}),
                        findByPk: jest.fn(() => sampleProfile),
                        create: jest.fn(() => sampleProfile),
                    },                    
                },
                {
                    provide: 'USER_SERVICE',
                    useValue: {
                        send: jest.fn(() => new Observable((x) => {
                            x.next();
                            x.complete();
                        })),
                    }
                },
            ],
        }).compile();

        client = moduleRef.get<ClientProxy>('USER_SERVICE');
        profileService = moduleRef.get<ProfileService>(ProfileService);
        profileRepository = moduleRef.get<typeof Profile>(getModelToken(Profile));

        findAllMock = jest.spyOn(profileRepository, 'findAll');
        findByPkMock = jest.spyOn(profileRepository, 'findByPk');
        createMock = jest.spyOn(profileRepository, 'create');
        sendMock = jest.spyOn(client, 'send');
    });

    describe('When calling getAllProfiles method', () => {
        it('should return an array of users', async () => {
            const result = await profileService.getAllProfiles();
            expect(result).toEqual([sampleProfile]);
            expect(findAllMock).toBeCalled();
        });
    });

    describe('When calling getOneProfile method', () => {
        describe('with an existing id', () => {
            let existingId = 1;

            it('should return one user', async () => {
                const result = await profileService.getOneProfile(existingId);
                expect(result).toEqual(sampleProfile);
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
                    return await profileService.getOneProfile(nonExistentId);
                }).rejects.toThrow(RpcException);
                expect(findByPkMock).toBeCalledWith(nonExistentId);
            });      
        });
    });

    describe('When calling createProfile method', () => {
        it('should return a created profile', async () => {
            const result = await profileService.createProfile(testProfile);
            expect(result).toEqual(sampleProfile);
            expect(createMock).toBeCalledWith(testProfile);
        });
    });

    describe('When calling updateProfile method', () => {
        describe('with an existing id', () => {
            it('should return an updated profile', async () => {
                const result = await profileService.updateProfile(testProfile);
                expect(result).toEqual(sampleProfile);
                expect(findByPkMock).toBeCalledWith(testProfile.id)
                expect(saveMock).toBeCalled();
            });
        });

        describe('with a non-existent id', () => {
            beforeEach(() => {
                findByPkMock.mockImplementationOnce(() => null);
            });

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await profileService.updateProfile(testProfile);
                }).rejects.toThrow(RpcException);
                expect(findByPkMock).toBeCalledWith(testProfile.id)
            });
        });
    });

    describe('When calling deleteProfile method', () => {
        describe('with an existing id', () => {
            let existingId = 1;

            it('should delete and return a profile', async () => {
                const result = await profileService.deleteProfile(existingId);
                expect(result).toEqual(sampleProfile);
                expect(findByPkMock).toBeCalledWith(existingId);
                expect(destroyMock).toBeCalled();
            });
        });

        describe('with a non-existent id', () => {
            beforeEach(() => {
                sendMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });
            let nonExistentId = 100;

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await profileService.deleteProfile(nonExistentId);
                }).rejects.toThrow(RpcException);
                expect(findByPkMock).toBeCalledWith(nonExistentId);
                expect(sendMock).toBeCalled();
            });
        });
    });
})
