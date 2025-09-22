import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from 'src/tokens/tokens.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersSerivce: UsersService,
        private readonly tokensService: TokensService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async validateUser(username: string, password: string) {
        const user = await this.usersSerivce.findByUsername(username);

        if (user && await this.usersSerivce.checkPassword(password, user.password)) {
            const {password, ...publicUser} = user;
            return publicUser;
        }

        return null;
    }

    async login(user: User, meta?: { ua?: string }) {
        const payload = {sub: user.id, username: user.username, role: user.role}

        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.config.get<string>('REFRESH_JWT_SECRET'),
            expiresIn: this.config.get<string>('REFRESH_JWT_TOKEN_EXPIRE_TIME') ?? '7d',
        }); 

        const decode = this.jwtService.decode(refresh_token) as {exp: number}; // decode the token and get the expires time
        const expiresAt = new Date(decode.exp * 1000);

        await this.tokensService.updateHashedRefreshToken({
            userId: user.id,
            plainRefreshToken: refresh_token,
            expiresAt: expiresAt,
            userAgent: meta?.ua ?? null
        })
 
        return {access_token, refresh_token};
    }

    async refreshToken(user: User) {
        const payload = {sub: user.id, username: user.username, role: user.role}

        const access_token = await this.jwtService.signAsync(payload);

        return {access_token};
    }
}
