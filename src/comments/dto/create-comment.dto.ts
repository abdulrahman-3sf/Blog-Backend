import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCommentDto {
    @Transform(({value}) => typeof value === 'string' ?  value.trim() : value)
    @IsNotEmpty()
    @IsString()
    @MaxLength(3000)
    content: string;
}