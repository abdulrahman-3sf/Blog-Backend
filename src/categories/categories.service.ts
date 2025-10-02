import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { slugifyTitle } from 'src/common/utils/slug.util';
import { UpdateCategoryDto } from './dto/update-category.dto';
import e from 'express';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
        private readonly dataSource: DataSource
    ) {}

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

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.categoryRepository.findOne({where: { id }});

        if (!category) {
            throw new NotFoundException('Category not found');
        }
        
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const uniqueSlug = await this.createSlug(updateCategoryDto.name);
            category.name = updateCategoryDto.name;
            category.slug = uniqueSlug;
        }

        if (updateCategoryDto.description) {
            category.description = updateCategoryDto.description;
        }

        return this.categoryRepository.save(category);
    }

    async delete(id: number, opts?: {force?: boolean}): Promise<void> {
        const category = await this.categoryRepository.findOne({where: { id }});

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const count = await this.dataSource
        .createQueryBuilder()
        .from('post_categories', 'pc')
        .where('pc."categoryId" = :id', {id})
        .getCount();

        if (count > 0 && !opts?.force) {
            throw new ConflictException('Category is in use by posts');
        }

        if (opts?.force) {
            await this.dataSource.transaction(async (trx) => {
                await trx
                .createQueryBuilder()
                .delete()
                .from('post_categories')
                .where('"categoryId" = :id', {id})
                .execute();

                await trx
                .createQueryBuilder()
                .delete()
                .from('categories')
                .where('id = :id', {id})
                .execute();
            });
        } else {
            await this.categoryRepository.delete(id);
        }
    }

    async findAll(params?: {withCounts?: boolean}): Promise<Array<Category & {postsCount?: number}>> {
        const withCounts = !!params?.withCounts;

        if (!withCounts) {
            return this.categoryRepository.find({
                order: {createdAt: 'DESC'}
            });
        }

        const query = this.categoryRepository
            .createQueryBuilder('c')
            .leftJoin('post_categories', 'pc', 'pc."categoryId" = c.id')
            .addSelect('COUNT(pc."postId")', 'postsCount')
            .groupBy('c.id')
            .orderBy('c."created_at"', 'DESC');

        const {entities, raw} = await query.getRawAndEntities();

        return entities.map((entities, i) => ({
            ...entities,
            postCount: Number(raw[i].postCount || 0)
        }));
    }
}