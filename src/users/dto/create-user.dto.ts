import { IsEmail, IsString, Length, Matches } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(3, 24)
    @Matches(/^[a-z0-9_]+$/i)
    username: string;

    @IsString()
    @Length(8, 72)
    password: string;
}