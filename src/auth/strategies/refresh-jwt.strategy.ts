import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";


@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('REFRESH_JWT_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload) {
        // const refreshToken = req.get('authorization')?.replace('Bearer', '').trim() ?? '';
        const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? '';
        const userAgent = (req.headers['user-agent'] as string) || 'unknown';

        const user = {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
        }

        return this.authService.validateRefreshToken(user, refreshToken, userAgent);
    }
}