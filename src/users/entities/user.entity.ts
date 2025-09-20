import { RefreshToken } from "src/auth/guards/entities/refresh-token.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Post } from "src/posts/entities/post.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    username: string;

    @Column()
    password: string;

    @Column({type: 'enum', enum: UserRole, default: UserRole.USER})
    role: UserRole;

    @OneToMany(() => Post, post => post.author)
    posts: Post[];

    @OneToMany(() => Comment, comment => comment.author)
    comments: Comment[];

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}