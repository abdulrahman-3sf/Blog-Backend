import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759439120623 implements MigrationInterface {
    name = 'Init1759439120623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "post_categories" (
                "postId" uuid NOT NULL,
                "categoryId" integer NOT NULL,
                CONSTRAINT "PK_post_categories" PRIMARY KEY ("postId", "categoryId")
            )
        `);

        await queryRunner.query(`CREATE INDEX "IDX_post_categories_post" ON "post_categories" ("postId")`);
        await queryRunner.query(`CREATE INDEX "IDX_post_categories_category" ON "post_categories" ("categoryId")`);

        await queryRunner.query(`
            ALTER TABLE "post_categories"
            ADD CONSTRAINT "FK_post_categories_post"
            FOREIGN KEY ("postId") REFERENCES "posts"("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "post_categories"
            ADD CONSTRAINT "FK_post_categories_category"
            FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_post_categories_category"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_post_categories_post"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_categories_category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_post_categories_post"`);
        await queryRunner.query(`DROP TABLE "post_categories"`);
    }
}
