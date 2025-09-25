import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiError } from 'src/common/swagger/responses';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsRepository: CommentsService) {}

    @ApiBearerAuth('access-token')
    @ApiSecurity('csrf-header')
    @ApiNoContentResponse({ description: 'Comment deleted' })
    @ApiForbiddenResponse({ description: 'Not author or admin', type: ApiError })
    @ApiNotFoundResponse({ description: 'Comment not found', type: ApiError })
    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    @HttpCode(204)
    async remove(@Param('commentId') commentId: string, @Request() req) {
        return this.commentsRepository.delete(commentId, {id: req.user.id, role: req.user.role});
    }
}

@ApiTags('posts')
@Controller('posts')
export class PostCommentsController {
    constructor(private readonly commentsRepository: CommentsService) {}

    @ApiBearerAuth('access-token')
    @ApiSecurity('csrf-header')
    @ApiCreatedResponse({
        description: 'Comment added',
        schema: { example: { id: 'uuid', postId: 'uuid', content: '...', authorId: 'uuid', createdAt: '...' } }
    })
    @ApiBadRequestResponse({ description: 'Validation error', type: ApiError })
    @UseGuards(JwtAuthGuard)
    @Post(':slug/comments')
    async add(
        @Param('slug') slug: string,
        @Request() req,
        @Body() createComentDto: CreateCommentDto
    ) {
        return this.commentsRepository.add(slug, req.user.id, createComentDto);
    }

    @ApiOkResponse({
        description: 'Comments under a post',
        schema: { example: [{ id: 'uuid', content: '...', authorId: 'uuid', createdAt: '...' }] }
    })
    @Get(':slug/comments')
    async list(@Param('slug') slug: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.commentsRepository.list(slug, Number(page), Number(limit));
    }
}