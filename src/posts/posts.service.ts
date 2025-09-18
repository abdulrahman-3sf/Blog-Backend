import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { slugifyTitle } from 'src/common/utils/slug.util';

@Injectable()
export class PostsService {
    constructor(@InjectRepository(Post) private readonly postsRepository: Repository<Post>) {}

    private async generateUniqueSlug(slugifyedTitle: string): Promise<string> {
        let base = slugifyedTitle.trim();
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

    private async createSlug(titile: string): Promise<string> {
        const base = slugifyTitle(titile);
        return await this.generateUniqueSlug(base);
    }

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
}
