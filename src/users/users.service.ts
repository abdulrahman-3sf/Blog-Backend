import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

    private UserWithoutPassword(user: User) {
        const {password, ...userWithoutPassword} = user;
        return userWithoutPassword;
    }

    // TODO: Test find by email only and username
    async create(dto: CreateUserDto) { 
        const userExists = await this.repo.findOne({
            where: [
                {email: dto.email},
                {username: dto.username}
            ]
        });

        if (userExists) {
            throw new ConflictException('Username/Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.repo.create({email: dto.email, username: dto.username, password: passwordHash});
        const savedUser = await this.repo.save(user);

        return this.UserWithoutPassword(savedUser);
    }

    async findById(id: string) {
        const user = await this.repo.findOne({ where: {id}});

        if (!user) {
            throw new NotFoundException('User not found!');
        }

        return this.UserWithoutPassword(user);
    }
}
