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
            const {password, ...userWithoutPassword} = user;
            return userWithoutPassword;
        }

        return null;
    }

    async login(user) {
        const payload = {username: user.username, sub: user.id}

        return { access_token: this.jwtService.sign(payload) };
    }
}
