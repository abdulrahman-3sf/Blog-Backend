import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req:any ): any {
        return this.authService.login(req.user, {ua: 'windos'});
    }

    @UseGuards(RefreshJwtAuthGuard)
    @Post('refresh')
    refreshToken(@Request() req) {
        return this.authService.refreshToken(req.user, {ua: 'windos'});
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Request() req) {
        const user = await this.usersService.findById(req.user.id);
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Request() req) {
        return this.authService.logout(req.user.id);
    }
}
