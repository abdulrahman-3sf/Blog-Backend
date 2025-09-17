import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersSerivce: UsersService) {}

    async validateUser(username: string, password: string) {
        const user = await this.usersSerivce.findUser("", username);

        if (user && user.password === await this.usersSerivce.hashPassword(password)) {
            const {password, ...userWithoutPassword} = user;
            return userWithoutPassword;
        }

        return null;
    }
}
