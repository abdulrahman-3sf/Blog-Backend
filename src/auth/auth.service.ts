import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersSerivce: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(username: string, password: string) {
        const user = await this.usersSerivce.findByUsername(username);

        if (user && await this.usersSerivce.checkPassword(password, user.password)) {
            const {password, ...publicUser} = user;
            return publicUser;
        }

        return null;
    }

    async login(user) {
        const payload = {sub: user.id, username: user.username, role: user.role}

        return { access_token: await this.jwtService.signAsync(payload) };
    }
}
