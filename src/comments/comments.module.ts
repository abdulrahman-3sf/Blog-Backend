import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController, PostCommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  providers: [CommentsService],
  controllers: [CommentsController, PostCommentsController],
})
export class CommentsModule {}
