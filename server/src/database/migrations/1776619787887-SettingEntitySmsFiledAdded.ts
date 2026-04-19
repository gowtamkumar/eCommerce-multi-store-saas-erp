import { MigrationInterface, QueryRunner } from "typeorm";

export class SettingEntitySmsFiledAdded1776619787887 implements MigrationInterface {
    name = 'SettingEntitySmsFiledAdded1776619787887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "sms" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "sms"`);
    }

}
