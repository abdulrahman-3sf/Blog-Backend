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

    private publicUser(user: User) {
        const {password, ...rest} = user;
        return rest;
    }

    async create(dto: CreateUserDto) { 
        const userExists = await this.repo.findOne({
            where: [
                {email: dto.email.toLowerCase().trim()},
                {username: dto.username.toLowerCase().trim()}
            ]
        });

        if (userExists) {
            throw new ConflictException('Username/Email already in use');
        }

        const passwordHash = await this.hashPassword(dto.password);
        const user = await this.repo.create({email: dto.email.toLowerCase().trim(), username: dto.username.toLowerCase().trim(), password: passwordHash});
        const savedUser = await this.repo.save(user);   

        return this.publicUser(savedUser);
    }

    async findById(id: string) {
        const user = await this.repo.findOne({ where: {id}});

        if (!user) {
            throw new NotFoundException('User not found!');
        }

        return this.publicUser(user);
    }

    async findByUsername(username:string) {
        return this.repo.findOne({ where: { username: username.toLowerCase().trim() } })
    }

    async findByEmail(email:string) {
        return this.repo.findOne({ where: { email: email.toLowerCase().trim() } })
    }

    async delete(id: string) {
        const user = await this.repo.findOne({ where: { id }});        
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.repo.remove(user);
    }
}
