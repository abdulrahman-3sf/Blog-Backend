import { Body, Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsRepo: PostsService) {}

    @UseGuards(JwtAuthGuard)
    @Post('create/')
    async create(
        @Request() req,
        @Body() createPostDto: CreatePostDto) {
        return this.postsRepo.create(req.user.id, createPostDto);
    }
}
