import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length, Matches } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ example: 'abdulrahman@gmail.com' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({ example: 'abdulrahman' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsString({ message: 'Username must be a string' })
    @Length(3, 24, { message: 'Username must be between 3 and 24 characters' })
    @Matches(/^[a-z0-9_]+$/, { message: 'username can contain letters, numbers and underscores only!'})
    username: string;

    @ApiProperty({ example: 'superSecret123!' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString({ message: 'Password must be a string' })
    @Length(8, 72, { message: 'Password must be between 8 and 72 characters' })
    @IsStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 2}, { message: 'Password must be 8–72 chars with upper, lower, number, and at least 2 symbols', })
    password: string;
}