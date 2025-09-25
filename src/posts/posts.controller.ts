import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiPaginationQueries } from 'src/common/swagger/pagination.decorators';
import { ApiError } from 'src/common/swagger/responses';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
    constructor(private readonly postsRepo: PostsService) {}

    @ApiBearerAuth('access-token')
    @ApiSecurity('csrf-header')
    @ApiCreatedResponse({
        description: 'Post created',
        schema: { example: { id: 'uuid', title: '...', slug: '...', content: '...', authorId: 'uuid', createdAt: '...' } }
    })
    @ApiBadRequestResponse({ description: 'Validation error', type: ApiError })
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Request() req,
        @Body() createPostDto: CreatePostDto) {
        return await this.postsRepo.create(req.user.id, createPostDto);
    }

    @ApiBearerAuth('access-token')
    @ApiSecurity('csrf-header')
    @ApiOkResponse({ description: 'Post updated' })
    @ApiForbiddenResponse({ description: 'Not owner or admin', type: ApiError })
    @ApiNotFoundResponse({ description: 'Post not found', type: ApiError })
    @UseGuards(JwtAuthGuard)
    @Patch(':postId')
    async update(
        @Param('postId') postId: string,
        @Body() updatePostDto: UpdatePostDto,
        @Request() req
    ) {
        return await this.postsRepo.update(postId, updatePostDto, req.user);
    }

    @ApiOkResponse({
        description: 'Post detail by slug',
        schema: { example: { id: 'uuid', title: '...', slug: '...', content: '...', authorId: 'uuid', createdAt: '...' } }
    })
    @ApiNotFoundResponse({ description: 'Post not found', type: ApiError })
    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.postsRepo.findBySlug(slug.toLowerCase().trim());
    }

    @ApiOkResponse({
        description: 'Paginated list of published posts',
        schema: {
        example: {
            page: 1, limit: 10, total: 42,
            data: [{ id: 'uuid', title: '...', slug: '...', excerpt: '...', authorId: 'uuid', createdAt: '...' }]
        }
        }
    })
    @ApiPaginationQueries()
    @Get()
    list(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.postsRepo.findPublic(Number(page), Number(limit));
    }

    @ApiBearerAuth('access-token')
    @ApiSecurity('csrf-header')
    @ApiNoContentResponse({ description: 'Post deleted' })
    @ApiForbiddenResponse({ description: 'Not owner or admin', type: ApiError })
    @ApiNotFoundResponse({ description: 'Post not found', type: ApiError })
    @UseGuards(JwtAuthGuard)
    @Delete(':postId')
    @HttpCode(204)
    async remove(@Param('postId') postId: string, @Request() req) {
        return this.postsRepo.delete(postId, req.user);
    }
}
