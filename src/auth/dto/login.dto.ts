import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'abdulrahman' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'superSecret123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
