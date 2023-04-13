import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './user.model';
import { InjectModel } from '@nestjs/sequelize';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @Inject('PROFILE_SERVICE') private client: ClientProxy,
  ){}

  async getAllUsers(){
    const users = await this.userRepository.findAll();
    return users;
  }

  async getOneUser(id: number){
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new RpcException({message:'Пользователь не найден', statusCode: HttpStatus.NOT_FOUND});
    }
    return user;
  }

  async getUserByEmail(email: string){
    const user = await this.userRepository.findOne({where: {email}})
    if (!user) {
      throw new RpcException({message:'Пользователь не найден', statusCode: HttpStatus.NOT_FOUND});
    }
    return user;
  }

  async createUser(userdto: CreateUserDto, payload: object){
    const hashPassword = await bcrypt.hash(userdto.password, 10);
    const userExists = await this.userRepository.findOne({where: {email: userdto.email}})

    if(userExists){
      throw new RpcException({message:'Пользователь уже существует', statusCode: HttpStatus.BAD_REQUEST});
    }

    const user = await this.userRepository.create({...userdto, password: hashPassword});
    payload['id'] = user.id;
    
    return this.client.send('profile.create', payload);
  }

  async deleteUser(id: number){
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new RpcException({message:'Пользователь не найден', statusCode: HttpStatus.NOT_FOUND});
    }
    await user.destroy();
    return null;
  }
}
