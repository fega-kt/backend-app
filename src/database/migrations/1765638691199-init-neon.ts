import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitNeon1765638691199 implements MigrationInterface {
  name = 'InitNeon1765638691199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT
      uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted" boolean NOT NULL
      DEFAULT false, "name" character varying NOT NULL, "code" character varying
      NOT NULL, "path" character varying NOT NULL, "created_by_id" uuid,
      "updated_by_id" uuid, "parent_id" uuid, "manager_id" uuid, "deputy_id"
      uuid, CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3" UNIQUE ("code"),
      CONSTRAINT "UQ_e15073bb06048b766cd7a83b819" UNIQUE ("path"), CONSTRAINT
      "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_translations_language_code_enum" AS
      ENUM('en_US', 'ru_RU')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_translations" ("id" uuid NOT NULL DEFAULT
      uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted" boolean NOT NULL
      DEFAULT false, "language_code"
      "public"."post_translations_language_code_enum" NOT NULL, "title"
      character varying NOT NULL, "description" character varying NOT NULL,
      "post_id" uuid NOT NULL, "created_by_id" uuid, "updated_by_id" uuid,
      CONSTRAINT "PK_977f23a9a89bf4a1a9e2e29c136" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT
      NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, "user_id"
      uuid NOT NULL, "created_by_id" uuid, "updated_by_id" uuid, CONSTRAINT
      "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" uuid NOT NULL DEFAULT
      uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted" boolean NOT NULL
      DEFAULT false, "is_email_verified" boolean NOT NULL DEFAULT false,
      "is_phone_verified" boolean NOT NULL DEFAULT false, "user_id" uuid NOT
      NULL, "created_by_id" uuid, "updated_by_id" uuid, CONSTRAINT
      "REL_4ed056b9344e6f7d8d46ec4b30" UNIQUE ("user_id"), CONSTRAINT
      "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."groups_permissions_enum" AS ENUM('ADD_USER',
      'UPDATE_USER', 'DELETE_USER', 'ADD_GROUP', 'UPDATE_GROUP', 'DELETE_GROUP',
      'ADD_DEPARTMENT', 'UPDATE_DEPARTMENT', 'DELETE_DEPARTMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT
      NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, "name"
      character varying NOT NULL, "code" character varying NOT NULL,
      "permissions" "public"."groups_permissions_enum" array NOT NULL DEFAULT
      '{}', "created_by_id" uuid, "updated_by_id" uuid, CONSTRAINT
      "UQ_8989cafa0945a366f0c8716e609" UNIQUE ("code"), CONSTRAINT
      "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT
      NULL DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, "first_name"
      character varying, "last_name" character varying, "role"
      "public"."users_role_enum" NOT NULL DEFAULT 'USER', "email" character
      varying, "password" character varying, "phone" character varying, "avatar"
      character varying, "full_name" character varying, "is_active" boolean NOT
      NULL DEFAULT false, "created_by_id" uuid, "updated_by_id" uuid,
      "department_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE
      ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_users" ("group_id" uuid NOT NULL, "user_id" uuid
      NOT NULL, CONSTRAINT "PK_36620c8747186b00c458893c594" PRIMARY KEY
      ("group_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be6db0d7dabab05d97233d19f6" ON "group_users"
      ("group_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eba8af4e65056abb4c5f62556c" ON "group_users"
      ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT
      "FK_c92e8cfee06c8e18abd172ea9e1" FOREIGN KEY ("created_by_id") REFERENCES
      "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT
      "FK_d149ad13b484d568edf6171131f" FOREIGN KEY ("updated_by_id") REFERENCES
      "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT
      "FK_700b0b13f494cb37b6ca929e79b" FOREIGN KEY ("parent_id") REFERENCES
      "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT
      "FK_ef8a4fb89ff96bbe98f1798798c" FOREIGN KEY ("manager_id") REFERENCES
      "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT
      "FK_d9aa8a7dec665d7b585e2063aba" FOREIGN KEY ("deputy_id") REFERENCES
      "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_translations" ADD CONSTRAINT
      "FK_61e2b4a034a8cea8b62987894d9" FOREIGN KEY ("created_by_id") REFERENCES
      "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_translations" ADD CONSTRAINT
      "FK_8c0fb5691708cc1d62a1b7b56c1" FOREIGN KEY ("updated_by_id") REFERENCES
      "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_translations" ADD CONSTRAINT
      "FK_11f143c8b50a9ff60340edca475" FOREIGN KEY ("post_id") REFERENCES
      "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_a49fb4c0e9e48ca31f8d9ffdad8"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_d09770dafc8207d5708dc87a2ea"
      FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON
      UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT
      "FK_ebb5035fbfa14554362ca746ed7" FOREIGN KEY ("created_by_id") REFERENCES
      "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT
      "FK_c5415bc5e902a317d8513007902" FOREIGN KEY ("updated_by_id") REFERENCES
      "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT
      "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES
      "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
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
      `ALTER TABLE "users" ADD CONSTRAINT "FK_1bbd34899b8e74ef2a7f3212806"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_80e310e761f458f272c20ea6add"
      FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION
      ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_0921d1972cf861d568f5271cd85"
      FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET
      NULL ON UPDATE NO ACTION`,
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
      `ALTER TABLE "group_users" DROP CONSTRAINT
      "FK_eba8af4e65056abb4c5f62556c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_users" DROP CONSTRAINT
      "FK_be6db0d7dabab05d97233d19f61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_0921d1972cf861d568f5271cd85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_80e310e761f458f272c20ea6add"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_1bbd34899b8e74ef2a7f3212806"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_eb35958cc11eb2c20df33d97473"`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" DROP CONSTRAINT "FK_65a98f23825ecdcdaaeefe1da15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT
      "FK_4ed056b9344e6f7d8d46ec4b302"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT
      "FK_c5415bc5e902a317d8513007902"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT
      "FK_ebb5035fbfa14554362ca746ed7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_d09770dafc8207d5708dc87a2ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_a49fb4c0e9e48ca31f8d9ffdad8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_translations" DROP CONSTRAINT
      "FK_11f143c8b50a9ff60340edca475"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_translations" DROP CONSTRAINT
      "FK_8c0fb5691708cc1d62a1b7b56c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_translations" DROP CONSTRAINT
      "FK_61e2b4a034a8cea8b62987894d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT
      "FK_d9aa8a7dec665d7b585e2063aba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT
      "FK_ef8a4fb89ff96bbe98f1798798c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT
      "FK_700b0b13f494cb37b6ca929e79b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT
      "FK_d149ad13b484d568edf6171131f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT
      "FK_c92e8cfee06c8e18abd172ea9e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eba8af4e65056abb4c5f62556c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_be6db0d7dabab05d97233d19f6"`,
    );
    await queryRunner.query(`DROP TABLE "group_users"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "groups"`);
    await queryRunner.query(`DROP TYPE "public"."groups_permissions_enum"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "post_translations"`);
    await queryRunner.query(
      `DROP TYPE "public"."post_translations_language_code_enum"`,
    );
    await queryRunner.query(`DROP TABLE "departments"`);
  }
}
