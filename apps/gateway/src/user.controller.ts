import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from './decorators/public.decorator';

@Controller('user')
export class UserController {
    constructor(
        @Inject('USER_SERVICE') private client: ClientProxy,
    ) {}

  
    @Get()
    async getAll(){
        return this.client.send('users', {});
    }

    @Get(':id')
    async getOne(
        @Param('id') id: number,
    ){
        return this.client.send('user.get', id);
    } 

    @Public()
    @Post('/registration')
    async create(
        @Body() payload: any,
    ){
        return this.client.send('user.create', payload);
    }

    @Public()
    @Post('/login')
    async login(
        @Body() payload: any,
    ){
        return this.client.send('user.login', payload);
    }
}
