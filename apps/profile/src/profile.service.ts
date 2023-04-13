import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Profile } from './profile.model';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile) private profileRepository: typeof Profile,
    @Inject('USER_SERVICE') private client: ClientProxy,
  ){}

  async getAllProfiles(){
    const profiles = await this.profileRepository.findAll();
    return profiles;
  }

  async getOneProfile(id: number){
    const profile = await this.profileRepository.findByPk(id);
    if (!profile) {
      throw new RpcException({message: 'Профиль не найден', statusCode: HttpStatus.NOT_FOUND});
    }
    return profile;
  }

  async createProfile(profileDto: CreateProfileDto){
    const profile = await this.profileRepository.create(profileDto);
    return profile;
  }

  async updateProfile(profileDto: CreateProfileDto){
    const profile = await this.profileRepository.findByPk(profileDto.id);

    if(!profile) {
      throw new RpcException({message:'Пользователь или роль не найдены', statusCode: HttpStatus.NOT_FOUND});
    }

    for (const key in profileDto) {
        if (profileDto[key] !== undefined) {
            profile[key] = profileDto[key];
        }
    }
    
    await profile.save();
    return profile;
  }

  async deleteProfile(id: number) {
    const profile = await this.profileRepository.findByPk(id);

    try{
      await profile?.destroy();
      await lastValueFrom(this.client.send('user.delete', id));
    } catch (e) {
      throw e;
    }

    return profile;
  }
}
