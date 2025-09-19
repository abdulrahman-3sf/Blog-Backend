import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
        @InjectRepository(Post) private readonly postsRepository: Repository<Post>
    ) {}

    private normalizePagination(page: number = 1, limit: number = 10): {pageSafe: number, limitSafe: number} {
        const pageSafe = Math.max(1, page);
        const limitSafe = Math.min(100, Math.max(1, limit));

        return {pageSafe, limitSafe};
    }

    async add(slug: string, actorId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
        const post = await this.postsRepository.findOne({ where: { slug: slug, published: true } });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const comment = await this.commentsRepository.create({
            content: createCommentDto.content,
            authorId: actorId,
            postId: post.id
        });

        return this.commentsRepository.save(comment);
    }

    async list(slug: string, page: number = 1, limit: number = 10): Promise<{
            items: Comment[];
            meta: {page: number, limit: number, total: number};
    }> {
        const post = await this.postsRepository.findOne({ where: { slug: slug, published: true } });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const { pageSafe, limitSafe } = this.normalizePagination(page, limit);

        const [items, total] = await this.commentsRepository.findAndCount({
            where: {postId: post.id},
            order: {createdAt: 'ASC'},
            take: limitSafe,
            skip: (pageSafe - 1) * limitSafe
        });

        return {
            items,
            meta: {page: pageSafe, limit: limitSafe, total}
        };
    }

    async delete(commentId: string, actor: {id: string, role: 'USER' | 'ADMIN'}) {
        const comment = await this.commentsRepository.findOne({ where: { id: commentId }, relations: {post: true}});        

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const allowed =  actor.role === 'ADMIN' || actor.id === comment.authorId || actor.id === comment.post.authorId;

        if (!allowed) {
            throw new ForbiddenException('not allowed')
        }

        await this.commentsRepository.remove(comment);
    }
}
