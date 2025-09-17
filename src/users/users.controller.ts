import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersRepo: UsersService) {}

    @Post()
    register(@Body() createUserDto: CreateUserDto) {
        return this.usersRepo.create(createUserDto);
    }

    @Get(':id')
    getUserByID(@Param('id') id: string) {
        return this.usersRepo.findById(id);
    }
}
