import type { MigrationInterface, QueryRunner } from 'typeorm';

export class GroupsPermissions1764251612306 implements MigrationInterface {
  name = 'GroupsPermissions1764251612306';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "permissions"`);
    await queryRunner.query(
      `CREATE TYPE "public"."groups_permissions_enum" AS ENUM('ADD_USER',
      'UPDATE_USER', 'DELETE_USER', 'ADD_GROUP', 'UPDATE_GROUP', 'DELETE_GROUP',
      'ADD_DEPARTMENT', 'UPDATE_DEPARTMENT', 'DELETE_DEPARTMENT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "permissions" "public"."groups_permissions_enum" array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "permissions"`);
    await queryRunner.query(`DROP TYPE "public"."groups_permissions_enum"`);
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "permissions" text array NOT NULL DEFAULT '{}'`,
    );
  }
}
