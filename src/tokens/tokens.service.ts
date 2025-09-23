import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { IsNull, Repository } from 'typeorm';
import * as argon2 from "argon2"; // its better for hash long text like tokens and have new algorithms for hashing

// consider we get it from .env
const DEFAULT_MAX_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000; // 30d
const DEFAULT_MAX_IDLE_MS = 7 * 24 * 60 * 60 * 1000;      // 7d

@Injectable()
export class TokensService {
    constructor(@InjectRepository(RefreshToken) private readonly refreshTokensRepository: Repository<RefreshToken>) {}

    async updateHashedRefreshToken(opts: {
        userId: string;
        plainRefreshToken: string;
        expiresAt: Date;
        userAgent?: string;
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
                userAgent: userAgent ?? 'unknown',
                lastUsedAt: new Date(),
            }, {
                conflictPaths: ['userId', 'userAgent'], // uses the UNIQUE(user_id, userAgent) index
            });
    }

    async getByUserIdAndUA(userId: string, userAgent: string) {
        return this.refreshTokensRepository.findOne({where: {userId, userAgent}});
    }

    async verifyStoredRefreshToken(userId: string, userAgent: string, plainRefreshToken: string) {
        const tokenRow = await this.getByUserIdAndUA(userId, userAgent);
        if (!tokenRow) return {ok: false, reason: 'missing'};
        if (!tokenRow.hashedToken) return {ok: false, reason: 'missing'};
        if (tokenRow.revokedAt) return {ok: false, reason: 'revoked'};
        if (tokenRow.expiresAt && tokenRow.expiresAt.getTime() < Date.now()) return {ok: false, reason: 'expired'};

        const now = Date.now();

        if (tokenRow.createdAt && now > tokenRow.createdAt.getTime() + DEFAULT_MAX_LIFETIME_MS) {
            this.revokeForUser(userId, userAgent);
            return {ok: false, reason: 'lifetime_exceeded'};
        }

        const anchor = tokenRow.lastUsedAt?.getTime() ?? tokenRow.createdAt?.getTime() ?? now;
        if (now > anchor + DEFAULT_MAX_IDLE_MS) {
            this.revokeForUser(userId, userAgent);
            return {ok: false, reason: 'idle_exceeded'};
        }

        const match = await argon2.verify(tokenRow.hashedToken, plainRefreshToken);
        if (!match) return {ok: false, reason: 'mismatch'};

        await this.refreshTokensRepository.update({userId, userAgent}, {lastUsedAt: new Date()});

        return {ok: true, tokenRow};
    }

    async revokeForUser(userId: string, userAgent: string) {
        await this.refreshTokensRepository.update(
            {userId, userAgent},
            {
                revokedAt: new Date(),
                hashedToken: null,
            }
        );
    }

    async revokeForUserAllDevices(userId: string) {
        await this.refreshTokensRepository.update(
            {userId, revokedAt: IsNull()},
            {
                revokedAt: new Date(),
                hashedToken: null,
            }
        );
    }
}
