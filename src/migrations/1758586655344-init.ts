import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758586655344 implements MigrationInterface {
    name = 'Init1758586655344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_a3f63cd9808a6b752a61272bfce"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_a3f63cd9808a6b752a61272bfce" UNIQUE ("hashed_token")`);
    }

}
