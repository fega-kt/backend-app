import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDepartment1760853440928 implements MigrationInterface {
  name = 'UpdateDepartment1760853440928';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "departments" ADD "parent_id" uuid`);
    await queryRunner.query(`ALTER TABLE "departments" ADD "manager_id" uuid`);
    await queryRunner.query(`ALTER TABLE "departments" ADD "deputy_id" uuid`);
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_d9aa8a7dec665d7b585e2063aba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_700b0b13f494cb37b6ca929e79b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP COLUMN "deputy_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP COLUMN "manager_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP COLUMN "parent_id"`,
    );
  }
}
