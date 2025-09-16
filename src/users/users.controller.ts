import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersRepo: UsersService) {}

    @Post()
    register(@Body() createUserDto: CreateUserDto) {
        return this.usersRepo.create(createUserDto);
    }
}
