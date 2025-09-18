import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: "posts"})
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({unique: true})
    slug: string;

    @Column({type: 'text'})
    body: string;

    @Column({default: false})
    published: boolean;

    @Column('uuid', { name: 'author_id' })
    authorId: string;

    @ManyToOne(() => User, (user) => user.posts, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'author_id'})
    author: User;

    @CreateDateColumn({ name: 'created_at' })
    createAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updateAt: Date;
}