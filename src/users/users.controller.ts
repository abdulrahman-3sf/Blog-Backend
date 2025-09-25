import { Body, Controller, Delete, Get, HttpCode, Param, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiError } from 'src/common/swagger/responses';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersRepo: UsersService) {}

    @ApiOperation({ summary: 'Register a new user account' })
    @ApiCreatedResponse({
        description: 'User registered successfully',
        schema: {
        example: {
            id: 'uuid',
            email: 'user@example.com',
            username: 'newuser',
            role: 'USER',
            createdAt: '2025-09-26T12:34:56.000Z',
        },
        },
    })
    @ApiBadRequestResponse({ description: 'Validation failed', type: ApiError })
    @Post()
    register(@Body() createUserDto: CreateUserDto) {
        return this.usersRepo.create(createUserDto);
    }

    @ApiOperation({ summary: 'Get user by ID' })
    @ApiOkResponse({
        description: 'User details',
        schema: {
        example: {
            id: 'uuid',
            email: 'user@example.com',
            username: 'johndoe',
            role: 'USER',
            createdAt: '2025-09-26T12:34:56.000Z',
        },
        },
    })
    @ApiNotFoundResponse({ description: 'User not found', type: ApiError })
    @Get(':id')
    getUserByID(@Param('id') id: string) {
        return this.usersRepo.findById(id);
    }

    @ApiOperation({ summary: 'Delete a user (admin only)' })
    @ApiBearerAuth('access-token')
    @ApiNoContentResponse({ description: 'User deleted' })
    @ApiUnauthorizedResponse({ description: 'Missing/invalid access token', type: ApiError })
    @ApiForbiddenResponse({ description: 'Requires ADMIN role', type: ApiError })
    @ApiNotFoundResponse({ description: 'User not found', type: ApiError })
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    @HttpCode(204)
    deleteUser(@Param('id') id: string) {
        return this.usersRepo.delete(id);
    }
}
