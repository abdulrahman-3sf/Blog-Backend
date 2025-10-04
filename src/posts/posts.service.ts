import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { slugifyTitle } from 'src/common/utils/slug.util';
import { UpdatePostDto } from './dto/update-post.dto';
import { CategoriesService } from 'src/categories/categories.service';

type Actor = {
    id: string,
    role: 'USER' | 'ADMIN',
}

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
        private readonly categoriesService: CategoriesService,
        private readonly dataSource: DataSource
    ) {}

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

    private isAuthorized(authorId: string, actor: Actor): boolean {
        let authorized = authorId === actor.id || actor.role === 'ADMIN';

        if (!authorized) {
            return false;
        }

        return true;
    }

    private normalizePagination(page: number = 1, limit: number = 10): {pageSafe: number, limitSafe: number} {
        const pageSafe = Math.max(1, page);
        const limitSafe = Math.min(100, Math.max(1, limit));

        return {pageSafe, limitSafe};
    }

    // -----------------------------------------------------------------------------------------

    async create(authorId: string, createPostDto: CreatePostDto): Promise<Post> {
        if (createPostDto.title.trim() == '' || createPostDto.body.trim() == '') {
            throw new BadRequestException('Title/Body should not be empty!');
        }

        return this.dataSource.transaction(async (manager) => {
            const uniqueSlug = await this.createSlug(createPostDto.title);

            const post = manager.create(Post, {
                title: createPostDto.title,
                body: createPostDto.body,
                slug: uniqueSlug,
                authorId: authorId,
                published: false
            });

            const saved = await manager.save(post);

            const inComingIds = createPostDto.categoryIds ?? [];
            const uniqueIds = [...new Set(inComingIds)];

            if (uniqueIds.length) {
                const {allExist, missing} = await this.categoriesService.existsByIds(uniqueIds);
                
                if (!allExist) {
                    throw new BadRequestException({
                        message: 'Some categories not found',
                        missingIds: missing,
                    });
                }

                await manager
                    .createQueryBuilder()
                    .insert()
                    .into('post_categories')
                    .values(uniqueIds.map(categoryId => ({postId: saved.id, categoryId})))
                    .orIgnore()
                    .execute();
            }

            return saved;
        })
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

        const uniqueIds = [...new Set(updatePostDto.categoryIds)];

        await this.dataSource.transaction(async (manager) => {
            await manager
                .createQueryBuilder()
                .delete()
                .from('post_categories')
                .where('"postId" = :postId', { postId })
                .execute();

            if (uniqueIds.length > 0) {
                await manager
                    .createQueryBuilder()
                    .insert()
                    .into('post_categories')
                    .values(uniqueIds.map((categoryId) => ({ postId, categoryId })))
                    .orIgnore()
                    .execute();
            }
        });

        return this.postsRepository.save(post);
    }

    async findBySlug(slug: string): Promise<Post> {
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
            order: {createdAt: 'DESC'},
            take: limitSafe,
            skip: (pageSafe - 1) * limitSafe
        });

        return {
            items,
            meta: {page: pageSafe, limit: limitSafe, total}
        };
    }

    async delete(postId: string, actor: Actor): Promise<void> {
        const post = await this.postsRepository.findOne({ where: { id: postId }});

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (!this.isAuthorized(post.authorId, actor)) {
            throw new ForbiddenException('Not allowed');
        }

        await this.postsRepository.remove(post);
    }
}
