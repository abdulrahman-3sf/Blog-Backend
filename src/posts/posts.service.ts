import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { slugifyTitle } from 'src/common/utils/slug.util';
import { UpdatePostDto } from './dto/update-post.dto';

type Actor = {
    id: string,
    role: 'USER' | 'ADMIN',
}

@Injectable()
export class PostsService {
    constructor(@InjectRepository(Post) private readonly postsRepository: Repository<Post>) {}

    private async generateUniqueSlug(slugifiedTitle: string): Promise<string> {
        let base = slugifiedTitle.trim();
        let candidate = base;
        let suffix = 2;

        const slugExists = async (slug: string) => {
            return await this.postsRepository.exists({ where: { slug } });
        }

        while (await slugExists(candidate)) {
            candidate = `${base}-${suffix}`;
            suffix += 1;
        }

        return candidate;
    }

    private async createSlug(title: string): Promise<string> {
        const base = slugifyTitle(title);
        return await this.generateUniqueSlug(base);
    }

    private isAuthorized(authorId: string, actor: Actor) {
        let authorized = authorId === actor.id || actor.role === 'ADMIN';

        if (!authorized) {
            return false;
        }

        return true;
    }

    private normalizePagination(page: number = 1, limit: number = 10) {
        const pageSafe = Math.max(1, page);
        const limitSafe = Math.min(100, Math.max(1, limit));

        return {pageSafe, limitSafe};
    }

    // -----------------------------------------------------------------------------------------

    async create(authorId: string, createPostDto: CreatePostDto): Promise<Post> {
        if (createPostDto.title.trim() == '' || createPostDto.body.trim() == '') {
            throw new BadRequestException('Title/Body should not be empty!');
        }

        const uniqueSlug = await this.createSlug(createPostDto.title);

        const post = this.postsRepository.create({
            title: createPostDto.title,
            body: createPostDto.body,
            slug: uniqueSlug,
            authorId: authorId,
            published: false
        });

        return this.postsRepository.save(post);
    }

    async update(postId: string, updatePostDto: UpdatePostDto, actor: Actor): Promise<Post> {
        let post = await this.postsRepository.findOne({ where: { id: postId } });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (!this.isAuthorized(post.authorId, actor)) {
            throw new ForbiddenException('Not allowed');
        }

        if (updatePostDto.title !== undefined) {
            const newTitle = updatePostDto.title.trim()

            if (post.title !== newTitle) {
                post.title = newTitle;

                const uniqueSlug = await this.createSlug(post.title);
                post.slug = uniqueSlug;
            }
        }

        if (updatePostDto.body !== undefined) {
            post.body = updatePostDto.body;
        }

        if (updatePostDto.published !== undefined) {
            post.published = updatePostDto.published;
        }

        return this.postsRepository.save(post);
    }

    async findBySlug(slug: string) {
        const post = await this.postsRepository.findOne({ where: { slug: slug, published: true } });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        return post;
    }

    async findPublic(page: number = 1, limit: number = 10): Promise<{
        items: Post[];
        meta: {page: number, limit: number, total: number};
    }> {
        const { pageSafe, limitSafe } = this.normalizePagination(page, limit);
        
        const [items, total] = await this.postsRepository.findAndCount({
            where : {published: true},
            order: {createAt: 'DESC'},
            take: limitSafe,
            skip: (pageSafe - 1) * limitSafe
        });

        return {
            items,
            meta: {page: pageSafe, limit: limitSafe, total}
        };
    }
}
