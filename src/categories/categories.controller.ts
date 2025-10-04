import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesRepository: CategoriesService) {}

    @Get()
    async list(@Query('withCounts') withCounts?: string) {
        const flag = (withCounts == 'true') || (withCounts == 'yes') || (withCounts == '1');
        return this.categoriesRepository.findAll({withCounts: flag});
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return await this.categoriesRepository.create(createCategoryDto);
    }
}
