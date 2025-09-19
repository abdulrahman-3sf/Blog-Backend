import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class CommentsController {
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
