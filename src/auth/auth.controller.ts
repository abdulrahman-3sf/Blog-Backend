import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req:any ) : any {
        return this.authService.login(req.user)
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Request() req) {
        const user = await this.usersService.findById(req.user.id);
        return user;
    }
}
