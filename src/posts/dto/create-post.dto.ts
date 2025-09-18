import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Column } from "typeorm";

export class CreatePostDto {
    @IsNotEmpty({ message: 'Title is required' })
    @IsString()
    @MaxLength(200, { message: 'Title must be shorter than 200 characters' })
    title: string;

    @IsNotEmpty({ message: 'Body is required' })
    @IsString()
    body: string;
}