import { Body, Controller, Delete, Get, HttpCode, Param, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

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

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    @HttpCode(204)
    deleteUser(@Param('id') id: string) {
        return this.usersRepo.delete(id);
    }
}
