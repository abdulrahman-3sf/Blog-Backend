import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdatePostDto {
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({ message: 'Title should not be empty!' })
    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Title must be shorter than 200 characters' })
    title?: string;
    
    @IsNotEmpty({ message: 'Body should not be empty!' })
    @IsOptional()
    @IsString()
    body?: string;

    @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}