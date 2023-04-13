import { HttpStatus, Injectable, } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './user.model';
import { RpcException } from '@nestjs/microservices';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ){}

  async loginUser(userDto: CreateUserDto){
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  private async validateUser(userDto: CreateUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    const passwordEquals = await bcrypt.compare(userDto?.password, user.password);

    if (passwordEquals) {
      return user;
    }
    
    throw new RpcException({message:'Некорректный пароль', statusCode: HttpStatus.UNAUTHORIZED});
  }

  private async generateToken(user: User) {    
    const payload = {email: user.email, id: user.id, role: user.role}
    const token = await this.jwtService.signAsync(payload);

    return {
      token
    };
  }
}
