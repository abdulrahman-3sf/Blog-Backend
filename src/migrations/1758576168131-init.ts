import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758576168131 implements MigrationInterface {
    name = 'Init1758576168131'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "user_agent" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_dc110d33236d565d0ff07ec6e9c" UNIQUE ("user_id", "user_agent")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_dc110d33236d565d0ff07ec6e9c"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "user_agent" DROP NOT NULL`);
    }

}
