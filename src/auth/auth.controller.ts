import { Controller, Get, HttpCode, Post, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import express from 'express';
import { CsrfSkip } from 'src/common/meta/csrf-skip.decorator';
import { clearRefreshCookie, issueCsrfCookie, setRefreshCookie } from 'src/common/utils/cookies.util';
import {
  ApiTags, ApiBearerAuth, ApiSecurity, ApiCookieAuth,
  ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiBadRequestResponse, ApiNotFoundResponse
} from '@nestjs/swagger';
import { ApiError } from 'src/common/swagger/responses';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @ApiCreatedResponse({ description: 'Login successful. Sets refresh cookie and returns access token.', schema: { example: { access_token: 'eyJ...' } } })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials', type: ApiError })
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

    @ApiOkResponse({ description: 'Returns new access token (refresh cookie rotated).', schema: { example: { access_token: 'eyJ...' } } })
    @ApiUnauthorizedResponse({ description: 'Missing/invalid refresh token', type: ApiError })
    @ApiSecurity('csrf-header')
    @ApiCookieAuth('refresh-cookie')
    @Throttle({ default: { ttl: 60, limit: 10 } })
    // @UseGuards(RefreshJwtAuthGuard)
    @HttpCode(200)
    @Post('refresh')
    async refreshToken(@Request() req, @Res({passthrough: true}) res: express.Response) {
        const name = process.env.REFRESH_COOKIE_NAME ?? 'refresh_token';
        const rf = req.cookies?.[name];
        if (!rf) throw new UnauthorizedException('Missing refresh token');

        const { access_token, refresh_token } = await this.authService.refreshToken(rf, {ua: req.headers['user-agent'] as string || 'unknown'});
    
        setRefreshCookie(res, refresh_token);

        return { access_token };
    }

    @ApiBearerAuth('access-token')
    @ApiOkResponse({ description: 'Current user profile' })
    @ApiUnauthorizedResponse({ description: 'No/invalid access token', type: ApiError })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Request() req) {
        return this.usersService.findById(req.user.id);
    }

    @ApiBearerAuth('access-token')
    @ApiNoContentResponse({ description: 'Logged out; refresh cookie cleared' })
    @ApiSecurity('csrf-header')
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req, @Res({passthrough: true}) res: express.Response) {
        await this.authService.logout(req.user.id, req.headers['user-agent'] as string);
        clearRefreshCookie(res);
        return;
    }

    @ApiBearerAuth('access-token')
    @ApiNoContentResponse({ description: 'All sessions revoked; refresh cookie cleared' })
    @ApiSecurity('csrf-header')
    @UseGuards(JwtAuthGuard)
    @Post('logout-all')
    async logoutAll(@Request() req, @Res({passthrough: true}) res: express.Response) {
        await this.authService.logoutAll(req.user.id);
        clearRefreshCookie(res);
        return;
    }
}