import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsRepository: CommentsService) {}

    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    @HttpCode(204)
    async remove(@Param('commentId') commentId: string, @Request() req) {
        return this.commentsRepository.delete(commentId, {id: req.user.id, role: req.user.role});
    }
}

@Controller('posts')
export class PostCommentsController {
    constructor(private readonly commentsRepository: CommentsService) {}

    @UseGuards(JwtAuthGuard)
    @Post(':slug/comments')
    async add(
        @Param('slug') slug: string,
        @Request() req,
        @Body() createComentDto: CreateCommentDto
    ) {
        return this.commentsRepository.add(slug, req.user.id, createComentDto);
    }

    @Get(':slug/comments')
    async list(@Param('slug') slug: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.commentsRepository.list(slug, Number(page), Number(limit));
    }
}