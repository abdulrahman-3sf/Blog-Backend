import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersSerivce: UsersService,
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

    async login(user: User) {
        const payload = {sub: user.id, username: user.username, role: user.role}

        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.config.get<string>('REFRESH_JWT_SECRET'),
            expiresIn: this.config.get<string>('REFRESH_JWT_TOKEN_EXPIRE_TIME') ?? '7d',
        });

        return {access_token, refresh_token};
    }

    async refreshToken(user: User) {
        const payload = {sub: user.id, username: user.username, role: user.role}

        const access_token = await this.jwtService.signAsync(payload);

        return {access_token};
    }
}
