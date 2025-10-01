import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TokensModule } from './tokens/tokens.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { CsrfGuard } from './common/guards/csrf.guard';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
        redact: {
          paths: [
            // Headers
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["x-api-key"]',
            'res.headers["set-cookie"]',

            // Body (explicit + single-level wildcards)
            'req.body.password',
            'req.body.passwordConfirmation',
            'req.body.currentPassword',
            'req.body.newPassword',
            'req.body.token',
            'req.body.accessToken',
            'req.body.refreshToken',
            'req.body.clientSecret',
            'req.body.secret',
            'req.body.apiKey',
            'req.body.recaptcha',

            // one level nested objects (adjust as you need)
            'req.body.*.password',
            'req.body.*.token',
            'req.body.*.secret',
            'req.body.*.apiKey',

            // Query/params
            'req.query.token',
            'req.query.code',
            'req.query.state',
            'req.params.token',

            // User attached to req
            'req.user.password',
            'req.user.refreshToken',

            // If you ever log response bodies (try to avoid)
            'res.body.password',
            'res.body.token',
            'res.body.secret',
            'res.body.apiKey',
            'res.body.*.password',
            'res.body.*.token',
            'res.body.*.secret',
            'res.body.*.apiKey',
          ],
          censor: '[REDACTED]',
          remove: false,
        },
      }
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 30 }]),
    ConfigModule.forRoot({isGlobal: true}), // Loads your .env file and makes values available everywhere.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: +config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASS', 'postgres'),
        database: config.get('DB_NAME', 'blogdb'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }), UsersModule, AuthModule, PostsModule, CommentsModule, TokensModule, CategoriesModule,
  ],
  // controllers: [AppController],
  providers: [
    {provide: APP_GUARD, useClass: ThrottlerGuard},
    {provide: APP_GUARD, useClass: CsrfGuard}
  ],
})
export class AppModule {}
