import { ApiProperty } from '@nestjs/swagger';

export class ApiError {
  @ApiProperty({ example: 403 }) statusCode: number;
  @ApiProperty({ example: 'Forbidden' }) message: string | string[];
  @ApiProperty({ example: 'POST_DELETE_NOT_ALLOWED', required: false }) code?: string;
  @ApiProperty({ example: '/posts/uuid' }) path: string;
  @ApiProperty({ example: '2025-09-24T12:34:56.000Z' }) timestamp: string;
}

export class PaginatedResponse<TData> {
  @ApiProperty({ example: 1 }) page: number;
  @ApiProperty({ example: 10 }) limit: number;
  @ApiProperty({ example: 42 }) total: number;
  // data typed at runtime via schema; keep as any for Swagger simplicity
  @ApiProperty({ isArray: true, type: Object }) data: TData[];
}
