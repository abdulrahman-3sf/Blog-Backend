import { Body, Controller, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsRepo: PostsService) {}

    @UseGuards(JwtAuthGuard)
    @Post('create/')
    async create(
        @Request() req,
        @Body() createPostDto: CreatePostDto) {
        return await this.postsRepo.create(req.user.id, createPostDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':postId')
    async update(
        @Param('postId') postId: string,
        @Body() updatePostDto: UpdatePostDto,
        @Request() req
    ) {
        return await this.postsRepo.update(postId, updatePostDto, req.user);
    }
}
