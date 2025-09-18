import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758213289039 implements MigrationInterface {
    name = 'Init1758213289039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_9e2c04950cd03e30218f5918056"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "auther_id"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "create_at"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "update_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "create_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "update_at"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "author_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_312c63be865c81b922e39c2475e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "author_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "update_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "create_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "update_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "create_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "auther_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_9e2c04950cd03e30218f5918056" FOREIGN KEY ("auther_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
