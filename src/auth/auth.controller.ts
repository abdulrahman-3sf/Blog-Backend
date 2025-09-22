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
    async login(@Request() req) {
        return this.authService.login(req.user, {ua: req.headers['user-agent'] as string || 'unknown'});
    }

    @UseGuards(RefreshJwtAuthGuard)
    @Post('refresh')
    async refreshToken(@Request() req) {
        return this.authService.refreshToken(req.user, {ua: req.headers['user-agent'] as string || 'unknown'});
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Request() req) {
        return this.usersService.findById(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req) {
        return this.authService.logout(req.user.id, req.headers['user-agent'] as string);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    async logoutAll(@Request() req) {
        return this.authService.logoutAll(req.user.id);
    }
}
