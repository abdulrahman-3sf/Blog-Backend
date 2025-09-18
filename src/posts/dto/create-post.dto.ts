import { IsNotEmpty } from "class-validator";
import { Column } from "typeorm";

export class CreatePostDto {
    @IsNotEmpty({ message: 'Title is required' })
    title: string;

    @IsNotEmpty({ message: 'Body is required' })
    body: string;
}