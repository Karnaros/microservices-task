import { Test } from "@nestjs/testing";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { RpcException } from "@nestjs/microservices";

describe('ProfileController', () => {
    const testProfile = {
        id: 1,
        firstname: "John",
        middlename: null,
        lastname: "Doe",
        about: "something",
        phoneNumber: null,
    };

    let profileController: ProfileController;
    let profileService: ProfileService;

    let getAllProfilesMock: jest.SpyInstance;
    let getOneProfileMock: jest.SpyInstance;
    let createProfileMock: jest.SpyInstance;
    let updateProfileMock: jest.SpyInstance;
    let deleteProfileMock: jest.SpyInstance;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ProfileController],
            providers: [
                {
                    provide: ProfileService,
                    useValue: {
                        getAllProfiles: jest.fn(() => ([testProfile])),
                        getOneProfile: jest.fn(() => testProfile),
                        createProfile: jest.fn(() => testProfile),
                        updateProfile: jest.fn(() => testProfile),
                        deleteProfile: jest.fn(() => testProfile),
                    },
                },
            ],
        }).compile();

        profileService = moduleRef.get<ProfileService>(ProfileService);
        profileController = moduleRef.get<ProfileController>(ProfileController);

        getAllProfilesMock = jest.spyOn(profileService, 'getAllProfiles');
        getOneProfileMock = jest.spyOn(profileService, 'getOneProfile');
        createProfileMock = jest.spyOn(profileService, 'createProfile');
        updateProfileMock = jest.spyOn(profileService, 'updateProfile');
        deleteProfileMock = jest.spyOn(profileService, 'deleteProfile');
    });

    describe('When calling getAll method', () => {
        it('should return an array of users', async () => {
            const result = await profileController.getAll();
            expect(result).toEqual([testProfile]);
            expect(getAllProfilesMock).toBeCalled();
        });
    });

    describe('When calling getOne method', () => {
        describe('with an existing id', () => {
            let existingId = 1;

            it('should return one user', async () => {
                const result = await profileController.getOne(existingId);
                expect(result).toEqual(testProfile);
                expect(getOneProfileMock).toBeCalledWith(existingId);
            });
        });

        describe('with a non-existent id', () => {
            beforeEach(() => {
                getOneProfileMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });
            let nonExistentId = 100;

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await profileController.getOne(nonExistentId);
                }).rejects.toThrow(RpcException);
                expect(getOneProfileMock).toBeCalledWith(nonExistentId);
            });
        });
    });

    describe('When calling create method', () => {
        describe('with a valid profile data', () => {
            it('should return a created profile', async () => {
                const result = await profileController.create(testProfile);
                expect(result).toEqual(testProfile);
                expect(createProfileMock).toBeCalledWith(testProfile);
            });
        });

        describe('with a non-valid profile data', () => {
            beforeEach(() => {
                createProfileMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await profileController.create(testProfile);
                }).rejects.toThrow(RpcException);
                expect(createProfileMock).toBeCalledWith(testProfile);
            });
        });
    });

    describe('When calling update method', () => {
        describe('with a valid profile data', () => {
            it('should return an updated profile', async () => {
                const result = await profileController.update(testProfile);
                expect(result).toEqual(testProfile);
                expect(updateProfileMock).toBeCalledWith(testProfile);
            });
        });

        describe('with a non-valid profile data', () => {
            beforeEach(() => {
                updateProfileMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });

            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await profileController.update(testProfile);
                }).rejects.toThrow(RpcException);
                expect(updateProfileMock).toBeCalledWith(testProfile);
            });
        });
    });

    describe('When calling delete method', () => {
        describe('with an existing id', () => {
            let existingId = 1;

            it('should delete and return a profile', async () => {
                const result = await profileController.delete(existingId);
                expect(result).toEqual(testProfile);
                expect(deleteProfileMock).toBeCalledWith(existingId);
            });
        });

        describe('with a non-existent id', () => {
            beforeEach(() => {
                deleteProfileMock.mockImplementationOnce(() => {
                    throw new RpcException('Some error');
                });
            });

            let nonExistentId = 100;
            it('should throw an RpcException', async () => {
                await expect(async () => {
                    return await profileController.delete(nonExistentId);
                }).rejects.toThrow(RpcException);
                expect(deleteProfileMock).toBeCalledWith(nonExistentId);
            });
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
})
