import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class UpdateCategoryDto {
    @ApiPropertyOptional({example: 'tech'})
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @Length(2, 80, {message: 'Name must be between 2 and 80 characters'})
    name?: string;

    @ApiPropertyOptional({example: 'tech is about ...'})
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @MaxLength(300, {message: 'Description must be shorter than 300 characters'})
    description?: string;
}