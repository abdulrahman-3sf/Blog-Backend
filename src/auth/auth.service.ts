import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersSerivce: UsersService) {}

    async validateUser(username: string, password: string) {
        const user = await this.usersSerivce.findUser("", username);

        if (user && await this.usersSerivce.checkPassword(password, user.password)) {
            const {password, ...userWithoutPassword} = user;
            return userWithoutPassword;
        }

        return null;
    }
}
