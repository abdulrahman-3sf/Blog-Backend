import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
        return await this.categoriesRepository.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(204)
    async delete(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) {
        const flag = force == 'true' || force == 'yes' || force == '1';
        return await this.categoriesRepository.delete(id, {force: flag});
    }
}
