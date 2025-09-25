import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreatePostDto {
    @ApiProperty({ example: 'My first post' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: 'Title is required' })
    @IsString()
    @MaxLength(200, { message: 'Title must be shorter than 200 characters' })
    title: string;

    @ApiProperty({ example: 'Hello world...' })
    @IsNotEmpty({ message: 'Body is required' })
    @IsString()
    body: string;
}