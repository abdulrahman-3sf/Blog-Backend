import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Title must be shorter than 200 characters' })
    title?: string;

    @IsOptional()
    @IsString()
    body?: string;

    @IsOptional()
    @IsString()
    published?: boolean;
}