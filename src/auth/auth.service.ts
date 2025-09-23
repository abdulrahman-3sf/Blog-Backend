import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from 'src/tokens/tokens.service';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async validateUser(username: string, password: string) {
        const user = await this.usersService.findByUsername(username);

        if (user && await this.usersService.checkPassword(password, user.password)) {
            const {password, ...publicUser} = user;
            return publicUser;
        }

        return null;
    }

    async login(user: {id: string, username: string, role: string}, meta?: { ua?: string }) {
        const payload = {sub: user.id, username: user.username, role: user.role}

        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.config.get<string>('REFRESH_JWT_SECRET'),
            expiresIn: this.config.get<string>('REFRESH_JWT_TOKEN_EXPIRE_TIME') ?? '7d',
        }); 

        const decoded = this.jwtService.decode(refresh_token) as {exp: number}; // decode the token and get the expires time
        const expiresAt = new Date(decoded.exp * 1000);

        await this.tokensService.updateHashedRefreshToken({
            userId: user.id,
            plainRefreshToken: refresh_token,
            expiresAt: expiresAt,
            userAgent: meta?.ua ?? 'unknown'
        })
 
        return {access_token, refresh_token};
    }

    async refreshToken(user: {id: string, username: string, role: string}, meta?: { ua?: string }) {
        return this.login(user, meta);
    }

    async validateRefreshToken(user: {id: string, username: string, role: string}, refreshToken: string, userAgent: string) {
        const checkToken = await this.tokensService.verifyStoredRefreshToken(user.id, userAgent || 'unknown', refreshToken);

        if (!checkToken.ok) {
            if (checkToken.reason === 'mismatch') {
                await this.tokensService.revokeForUserAllDevices(user.id);
            }

            switch(checkToken.reason) {
                case 'missing':
                    throw new UnauthorizedException('No active refresh session');
                case 'revoked':
                    throw new UnauthorizedException('Refresh token revoked');
                case 'expired':
                    throw new UnauthorizedException('Refresh token expired');
                case 'lifetime_exceeded':
                    throw new UnauthorizedException('Session maximum lifetime exceeded');
                case 'idle_exceeded':
                    throw new UnauthorizedException('Session idle timeout exceeded');
                case 'mismatch':
                default:
                    throw new UnauthorizedException('Invalid refresh token');
            }
        }

        return user;
    }

    async logout(userId: string, userAgent: string) {
        await this.tokensService.revokeForUser(userId, userAgent || 'unknown');
        return { success: true };
    }

    async logoutAll(userId: string) {
        await this.tokensService.revokeForUserAllDevices(userId);
        return { success: true };
    }
}
