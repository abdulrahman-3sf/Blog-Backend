import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758574573163 implements MigrationInterface {
    name = 'Init1758574573163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "hashed_token" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "hashed_token" SET NOT NULL`);
    }

}
