import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758566192093 implements MigrationInterface {
    name = 'Init1758566192093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "revoked_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "revoked_at" SET NOT NULL`);
    }

}
