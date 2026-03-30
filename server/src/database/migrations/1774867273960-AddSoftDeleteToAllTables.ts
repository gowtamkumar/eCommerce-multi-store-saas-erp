import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToAllTables1774867273960 implements MigrationInterface {
    name = 'AddSoftDeleteToAllTables1774867273960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tables = [
            "subscription_plans",
            "tenants",
            "users",
            "tenant_traffic",
            "subscription_invoices",
            "platform_settings",
            "audit_logs",
            "reviews",
            "pages",
            "faqs",
            "suppliers",
            "brands",
            "categories",
            "product_attributes",
            "product_variants",
            "products",
            "wishlists",
            "shipping_addresses",
            "carts",
            "cart_items",
            "promotions",
            "order_items",
            "order_returns",
            "orders",
            "payments",
            "coupons",
            "inventory_transactions",
            "files",
            "purchase_order_items",
            "purchase_orders",
            "supplier_payments",
            "invoices",
            "expenses",
            "subscribers",
            "leads",
            "staff_invitations"
        ];

        for (const table of tables) {
            await queryRunner.query(`ALTER TABLE "${table}" ADD column IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tables = [
            "subscription_plans",
            "tenants",
            "users",
            "tenant_traffic",
            "subscription_invoices",
            "platform_settings",
            "audit_logs",
            "reviews",
            "pages",
            "faqs",
            "suppliers",
            "brands",
            "categories",
            "product_attributes",
            "product_variants",
            "products",
            "wishlists",
            "shipping_addresses",
            "carts",
            "cart_items",
            "promotions",
            "order_items",
            "order_returns",
            "orders",
            "payments",
            "coupons",
            "inventory_transactions",
            "files",
            "purchase_order_items",
            "purchase_orders",
            "supplier_payments",
            "invoices",
            "expenses",
            "subscribers",
            "leads",
            "staff_invitations"
        ];

        for (const table of tables) {
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "deleted_at"`);
        }
    }
}
