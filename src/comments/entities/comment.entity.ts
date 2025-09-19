import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'comments'})
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'text'})
    content: string;

    @Column({type: 'uuid',name: 'author_id', nullable: true})
    authorId: string | null;

    @ManyToOne(() => User, user => user.comments, {onDelete: 'SET NULL', nullable: true})
    @JoinColumn({name: 'author_id'})
    author: User;

    @Column({type: 'uuid', name: 'post_id'})
    postId: string;

    @ManyToOne(() => Post, post => post.comments, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'post_id'})
    post: Post;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}