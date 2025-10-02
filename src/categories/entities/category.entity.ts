import { Post } from "src/posts/entities/post.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'categories'})
export class Category {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({type: 'varchar', length: 80, nullable: false})
    name: string;

    @Column({type: 'varchar', length: 100, nullable: false, unique: true})
    slug: string;

    @Column({type: 'text'})
    description: string;

    @ManyToMany(() => Post, (post) => post.categories)
    posts: Post[];

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;
}