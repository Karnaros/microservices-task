import { Controller, UsePipes } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ValidationPipe } from '@app/common/pipes/validation.pipe';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @MessagePattern('profiles')
  async getAll(){
    return this.profileService.getAllProfiles();
  }

  @MessagePattern('profile.get')
  async getOne(
    @Payload() id: number,
  ){
    return this.profileService.getOneProfile(id);
  }

  @UsePipes(ValidationPipe)
  @MessagePattern('profile.create')
  async create(
    @Payload() createProfileDto: CreateProfileDto,
  ){
    return this.profileService.createProfile(createProfileDto);
  }

  @UsePipes(ValidationPipe)
  @MessagePattern('profile.update')
  async update(
    @Payload() createProfileDto: CreateProfileDto,
  ){
    return this.profileService.updateProfile(createProfileDto);
  }
  
  @MessagePattern('profile.delete')
  async delete(
    @Payload() id: number,
    ){
    return this.profileService.deleteProfile(id);
  }
}
