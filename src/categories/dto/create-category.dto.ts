import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({example: 'tech'})
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsNotEmpty({message: 'Name is required'})
    @IsString()
    @MaxLength(80, {message: 'Name must be shorter than 80 characters'})
    name: string;

    @ApiProperty({example: 'tech is about ...'})
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @MaxLength(300, {message: 'Description must be shorted than 300 characters'})
    description: string;
}