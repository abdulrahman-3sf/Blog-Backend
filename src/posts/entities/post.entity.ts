import { Category } from "src/categories/entities/category.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @ManyToMany(() => Category, {eager: false})
    @JoinTable({
        name: 'post_categories',
        joinColumn: {name: 'postId', referencedColumnName: 'id'},
        inverseJoinColumn: {name: 'categoryId', referencedColumnName: 'id'}
    })
    categories: Category[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}