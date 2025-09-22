import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758584946149 implements MigrationInterface {
    name = 'Init1758584946149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "last_used_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_a3f63cd9808a6b752a61272bfce"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "hashed_token"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "hashed_token" text`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_a3f63cd9808a6b752a61272bfce" UNIQUE ("hashed_token")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_a3f63cd9808a6b752a61272bfce"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "hashed_token"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "hashed_token" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_a3f63cd9808a6b752a61272bfce" UNIQUE ("hashed_token")`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "last_used_at"`);
    }

}
