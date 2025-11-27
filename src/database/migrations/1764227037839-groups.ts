import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Groups1764227037839 implements MigrationInterface {
  name = 'Groups1764227037839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT
      NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, "name"
      character varying NOT NULL, "code" character varying NOT NULL,
      "created_by_id" uuid, "updated_by_id" uuid, CONSTRAINT
      "UQ_8989cafa0945a366f0c8716e609" UNIQUE ("code"), CONSTRAINT
      "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_users" ("group_id" uuid NOT NULL, "user_id" uuid
      NOT NULL, CONSTRAINT "PK_36620c8747186b00c458893c594" PRIMARY KEY
      ("group_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be6db0d7dabab05d97233d19f6" ON "group_users" ("group_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eba8af4e65056abb4c5f62556c" ON "group_users" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD CONSTRAINT "FK_65a98f23825ecdcdaaeefe1da15"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD CONSTRAINT "FK_eb35958cc11eb2c20df33d97473"
      FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_users" ADD CONSTRAINT
      "FK_be6db0d7dabab05d97233d19f61" FOREIGN KEY ("group_id") REFERENCES
      "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_users" ADD CONSTRAINT
      "FK_eba8af4e65056abb4c5f62556c6" FOREIGN KEY ("user_id") REFERENCES
      "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_users" DROP CONSTRAINT "FK_eba8af4e65056abb4c5f62556c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_users" DROP CONSTRAINT "FK_be6db0d7dabab05d97233d19f61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_eb35958cc11eb2c20df33d97473"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_65a98f23825ecdcdaaeefe1da15"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eba8af4e65056abb4c5f62556c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_be6db0d7dabab05d97233d19f6"`,
    );
    await queryRunner.query(`DROP TABLE "group_users"`);
    await queryRunner.query(`DROP TABLE "groups"`);
  }
}
