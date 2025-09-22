import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import * as argon2 from "argon2"; // its better for hash long text like tokens and have new algorithms for hashing

@Injectable()
export class TokensService {
    constructor(@InjectRepository(RefreshToken) private readonly refreshTokensRepository: Repository<RefreshToken>) {}

    async updateHashedRefreshToken(opts: {
        userId: string;
        plainRefreshToken: string;
        expiresAt: Date;
        userAgent?: string | null;
    }) {
        const {userId, plainRefreshToken, expiresAt, userAgent} = opts;
        const hashedRefreshToken = await argon2.hash(plainRefreshToken);

        await this.refreshTokensRepository.upsert(
            {
                userId,
                hashedToken: hashedRefreshToken,
                expiresAt,
                revokedAt: null,
                replacedBy: null,
                userAgent: userAgent ?? null,
            }, {
                conflictPaths: ['userId'], // uses the UNIQUE(user_id) index
            });
    }
}
