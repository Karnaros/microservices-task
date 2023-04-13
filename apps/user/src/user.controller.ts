import { Controller, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidationPipe } from '@app/common/pipes/validation.pipe';
import { AuthService } from './auth.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    ) {}

  @MessagePattern('users')
  async getAll(){
    return this.userService.getAllUsers();
  }

  @MessagePattern('user.get')
  async getOne(
    @Payload() id: number
    ){
    return this.userService.getOneUser(id);
  }

  @UsePipes(ValidationPipe)
  @MessagePattern('user.create')
  async create(
    @Payload() userdto: CreateUserDto,
    @Payload() payload: object,
  ){
    return this.userService.createUser(userdto, payload);
  }

  @UsePipes(ValidationPipe)
  @MessagePattern('user.login')
  async login(
    @Payload() userdto: CreateUserDto,
  ){
    return this.authService.loginUser(userdto);
  }

  @MessagePattern('user.delete')
  async delete(
    @Payload() id: number
  ){
    return this.userService.deleteUser(id);
  }
}
