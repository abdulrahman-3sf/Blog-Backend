import { SetMetadata } from '@nestjs/common';
export const CSRF_SKIP_KEY = 'csrf_skip';
export const CsrfSkip = () => SetMetadata(CSRF_SKIP_KEY, true);
