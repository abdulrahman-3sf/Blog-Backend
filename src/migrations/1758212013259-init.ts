import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758212013259 implements MigrationInterface {
    name = 'Init1758212013259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "slug" character varying NOT NULL, "body" text NOT NULL, "published" boolean NOT NULL DEFAULT false, "auther_id" uuid NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "update_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_9e2c04950cd03e30218f5918056" FOREIGN KEY ("auther_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_9e2c04950cd03e30218f5918056"`);
        await queryRunner.query(`DROP TABLE "posts"`);
    }

}
