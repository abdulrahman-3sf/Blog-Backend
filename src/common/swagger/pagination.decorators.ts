import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginationQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, example: 1, description: '1-based page index' }),
    ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page (max 100)' }),
  );
}