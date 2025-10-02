import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759438672936 implements MigrationInterface {
    name = 'Init1759438672936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying(80) NOT NULL, "slug" character varying(100) NOT NULL, "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_categroies" ("postId" uuid NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "PK_dc1a4c78d3bc02b5075fa278195" PRIMARY KEY ("postId", "categoryId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fbc2a6a11ec13fb47609f5bdfe" ON "post_categroies" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a4c92fead4a9d46798ec2f873" ON "post_categroies" ("categoryId") `);
        await queryRunner.query(`ALTER TABLE "post_categroies" ADD CONSTRAINT "FK_fbc2a6a11ec13fb47609f5bdfe9" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categroies" ADD CONSTRAINT "FK_3a4c92fead4a9d46798ec2f8734" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categroies" DROP CONSTRAINT "FK_3a4c92fead4a9d46798ec2f8734"`);
        await queryRunner.query(`ALTER TABLE "post_categroies" DROP CONSTRAINT "FK_fbc2a6a11ec13fb47609f5bdfe9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a4c92fead4a9d46798ec2f873"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fbc2a6a11ec13fb47609f5bdfe"`);
        await queryRunner.query(`DROP TABLE "post_categroies"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
