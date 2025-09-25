import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdatePostDto {
    @ApiProperty({ example: 'My first post' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: 'Title should not be empty!' })
    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Title must be shorter than 200 characters' })
    title?: string;
    
    @ApiProperty({ example: 'Hello world...' })
    @IsNotEmpty({ message: 'Body should not be empty!' })
    @IsOptional()
    @IsString()
    body?: string;

    @ApiProperty({ example: true })
    @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}