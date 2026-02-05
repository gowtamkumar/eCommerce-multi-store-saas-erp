import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFaqFieldsToProduct1738759000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add faqSource column
        await queryRunner.addColumn('products', new TableColumn({
            name: 'faqSource',
            type: 'varchar',
            length: '50',
            default: "'manual'",
        }));

        // Add faqIds column
        await queryRunner.addColumn('products', new TableColumn({
            name: 'faqIds',
            type: 'text',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'faqSource');
        await queryRunner.dropColumn('products', 'faqIds');
    }
}
