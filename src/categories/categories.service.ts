import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(@InjectRepository(Category) private readonly categoryRepository: Repository<Category>) {}

    create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        
    }
}
