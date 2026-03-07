import { MigrationInterface, QueryRunner } from "typeorm";

export class SettingEntityNavbarAllfiledMarge1772894874641 implements MigrationInterface {
    name = 'SettingEntityNavbarAllfiledMarge1772894874641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_settings" RENAME COLUMN "navbar_links" TO "navbar"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_settings" RENAME COLUMN "navbar" TO "navbar_links"`);
    }

}
