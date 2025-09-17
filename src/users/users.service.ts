import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async checkPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    private UserWithoutPassword(user: User) {
        const {password, ...userWithoutPassword} = user;
        return userWithoutPassword;
    }

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

        const passwordHash = await this.hashPassword(dto.password);
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

    // TODO: solve the id problem
    async findByUsername(username:string) {
        return this.repo.findOne({ where: { username: username.toLowerCase().trim() } })
    }

    async findByEmail(email:string) {
        return this.repo.findOne({ where: { email: email.toLowerCase().trim() } })
    }
}
