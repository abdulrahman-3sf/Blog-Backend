import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { User } from "src/users/entities/user.entity";
import { DataSource } from "typeorm";

config();
const configService = new ConfigService();

export default new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'), // or use process.env.DB_HOST
    port: +configService.get<number>('DB_PORT', 5432),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    entities: ['src/**/*.entity.{ts,js}'],
    migrations: ['src/migrations/*.{ts,js}'],
    synchronize: false,
    logging: true
});