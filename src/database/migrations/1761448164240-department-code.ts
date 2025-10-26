import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DepartmentCode1761448164240 implements MigrationInterface {
  name = 'DepartmentCode1761448164240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3" UNIQUE ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "UQ_e15073bb06048b766cd7a83b819" UNIQUE ("path")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "UQ_e15073bb06048b766cd7a83b819"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3"`,
    );
  }
}
