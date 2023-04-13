import { Body, Controller, Delete, Get, HttpException, Inject, Param, Patch, HttpStatus, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SelfGuard } from './guards/self.guard';

@Controller('profile')
export class ProfileController {
    constructor(
        @Inject('PROFILE_SERVICE') private client: ClientProxy,
    ) {}

    @Get()
    async getAll(){
        return this.client.send('profiles', {});
    }

    @Get(':id')
    async getOne(
        @Param('id') id: number,
    ){
        return this.client.send('profile.get', id);
    }
    
    @UseGuards(SelfGuard)
    @Patch()
    async update(
        @Body() payload: any,
    ){
        return this.client.send('profile.update', payload);
    }

    @UseGuards(SelfGuard)
    @Delete(':id')
    async delete(
        @Param('id') id: number,
    ){
        return this.client.send('profile.delete', id);
    }
}
