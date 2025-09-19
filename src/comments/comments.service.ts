import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { PostsService } from 'src/posts/posts.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
        private readonly postsService: PostsService
    ) {}

    async add(slug: string, actorId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
        const post = await this.postsService.findBySlug(slug);

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
        const post = await this.postsService.findBySlug(slug);

        const { pageSafe, limitSafe } = this.postsService.normalizePagination(page, limit);

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
}
