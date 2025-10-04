import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesRepository: CategoriesService) {}

    @Get()
    async list(@Query('withCounts') withCounts?: string) {
        const flag = (withCounts == 'true') || (withCounts == 'yes') || (withCounts == '1');
        return this.categoriesRepository.findAll({withCounts: flag});
    }
}
