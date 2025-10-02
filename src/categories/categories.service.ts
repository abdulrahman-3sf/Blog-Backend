import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { slugifyTitle } from 'src/common/utils/slug.util';

@Injectable()
export class CategoriesService {
    constructor(@InjectRepository(Category) private readonly categoryRepository: Repository<Category>) {}

    private async generateUniqueSlug(slugifiedText: string): Promise<string> {
        let base = slugifiedText.trim();
        let candidate = base;
        let suffix = 2;

        const slugExists = async (slug: string) => {
            return await this.categoryRepository.exists({where: { slug }});
        }

        while (await slugExists(candidate)) {
            candidate = `${base}-${suffix}`;
            suffix += 1;
        }

        return candidate;
    }

    private async createSlug(text: string): Promise<string> {
        const base = slugifyTitle(text);
        return await this.generateUniqueSlug(base);
    }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const uniqueSlug = await this.createSlug(createCategoryDto.name);

        const category = this.categoryRepository.create({
            name: createCategoryDto.name,
            slug: uniqueSlug,
            description: createCategoryDto.description
        });

        return this.categoryRepository.save(category);
    }
}
