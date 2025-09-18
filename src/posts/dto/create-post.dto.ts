import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreatePostDto {
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: 'Title is required' })
    @IsString()
    @MaxLength(200, { message: 'Title must be shorter than 200 characters' })
    title: string;

    @IsNotEmpty({ message: 'Body is required' })
    @IsString()
    body: string;
}