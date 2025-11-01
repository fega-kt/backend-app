import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UserFullname1762007482779 implements MigrationInterface {
  name = 'UserFullname1762007482779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "full_name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);
  }
}
