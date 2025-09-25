import { Controller, Get, Post, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import express from 'express';
import { CsrfSkip } from 'src/common/meta/csrf-skip.decorator';
import { clearRefreshCookie, issueCsrfCookie, setRefreshCookie } from 'src/common/utils/cookies.util';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Throttle({ default: { ttl: 60, limit: 10 } })
    @UseGuards(LocalAuthGuard)
    @CsrfSkip()
    @Post('login')
    async login(@Request() req, @Res({passthrough: true}) res: express.Response) {
        const { access_token, refresh_token } = await this.authService.login(req.user, {ua: req.headers['user-agent'] as string || 'unknown'});
        setRefreshCookie(res, refresh_token);
        issueCsrfCookie(res);
        return { access_token };
    }

    @Throttle({ default: { ttl: 60, limit: 10 } })
    // @UseGuards(RefreshJwtAuthGuard)
    @Post('refresh')
    async refreshToken(@Request() req, @Res({passthrough: true}) res: express.Response) {
        const name = process.env.REFRESH_COOKIE_NAME ?? 'refresh_token';
        const rf = req.cookies?.[name];
        if (!rf) throw new UnauthorizedException('Missing refresh token');

        const { access_token, refresh_token } = await this.authService.refreshToken(rf, {ua: req.headers['user-agent'] as string || 'unknown'});
    
        setRefreshCookie(res, refresh_token);

        return { access_token };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Request() req) {
        return this.usersService.findById(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req, @Res({passthrough: true}) res: express.Response) {
        await this.authService.logout(req.user.id, req.headers['user-agent'] as string);
        clearRefreshCookie(res);
        return;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    async logoutAll(@Request() req, @Res({passthrough: true}) res: express.Response) {
        await this.authService.logoutAll(req.user.id);
        clearRefreshCookie(res);
        return;
    }
}
