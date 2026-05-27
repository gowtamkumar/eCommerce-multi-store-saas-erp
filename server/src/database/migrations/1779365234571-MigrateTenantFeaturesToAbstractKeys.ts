import { MigrationInterface, QueryRunner } from 'typeorm'

export class MigrateTenantFeaturesToAbstractKeys1779365234571 implements MigrationInterface {
  name = 'MigrateTenantFeaturesToAbstractKeys1779365234571'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create temporary mapping table
    await queryRunner.query(`
      CREATE TEMP TABLE feature_slug_mapping (
        old_slug varchar NOT NULL,
        new_slug varchar NOT NULL
      );
    `)

    // 2. Insert all route path-to-feature mappings
    await queryRunner.query(`
      INSERT INTO feature_slug_mapping (old_slug, new_slug) VALUES
      ('/admin/pos', 'pos'),
      ('/admin/pos-registers', 'pos'),
      ('/admin/finance', 'finance'),
      ('/admin/finance/profit-loss', 'finance'),
      ('/admin/finance/balance-sheet', 'finance'),
      ('/admin/finance/ledger', 'finance'),
      ('/admin/finance/ar', 'finance'),
      ('/admin/finance/ap', 'finance'),
      ('/admin/finance/wallet', 'finance'),
      ('/admin/finance/accounts', 'finance'),
      ('/admin/finance/cash-flow', 'finance'),
      ('/admin/finance/fiscal-periods', 'finance'),
      ('/admin/finance/tax', 'finance'),
      ('/admin/expenses', 'finance'),
      ('/admin/hrm', 'hrm'),
      ('/admin/hrm/dashboard', 'hrm'),
      ('/admin/hrm/employees', 'hrm'),
      ('/admin/hrm/departments', 'hrm'),
      ('/admin/hrm/designations', 'hrm'),
      ('/admin/hrm/attendance', 'hrm'),
      ('/admin/hrm/leaves', 'hrm'),
      ('/admin/hrm/shifts', 'hrm'),
      ('/admin/hrm/payroll', 'hrm'),
      ('/admin/hrm/recruitment', 'hrm'),
      ('/admin/hrm/performance', 'hrm'),
      ('/admin/orders', 'orders'),
      ('/admin/carts', 'orders'),
      ('/admin/returns', 'orders'),
      ('/admin/payments', 'orders'),
      ('/admin/invoices', 'orders'),
      ('/admin/customers', 'orders'),
      ('/admin/products', 'catalog'),
      ('/admin/categories', 'catalog'),
      ('/admin/brands', 'catalog'),
      ('/admin/price-books', 'catalog'),
      ('/admin/media', 'catalog'),
      ('/admin/reviews', 'catalog'),
      ('/admin/inventory', 'inventory'),
      ('/admin/warehouses', 'inventory'),
      ('/admin/stock-transfers', 'inventory'),
      ('/admin/batches', 'inventory'),
      ('/admin/cycle-count', 'inventory'),
      ('/admin/purchases', 'purchasing'),
      ('/admin/suppliers', 'purchasing'),
      ('/admin/grn', 'purchasing'),
      ('/admin/procurement/dashboard', 'purchasing'),
      ('/admin/procurement/suppliers', 'purchasing'),
      ('/admin/procurement/requisitions', 'purchasing'),
      ('/admin/procurement/rfqs', 'purchasing'),
      ('/admin/procurement/purchases', 'purchasing'),
      ('/admin/procurement/grn', 'purchasing'),
      ('/admin/procurement/invoices', 'purchasing'),
      ('/admin/procurement/debit-notes', 'purchasing'),
      ('/admin/campaigns', 'marketing'),
      ('/admin/coupons', 'marketing'),
      ('/admin/promotions', 'marketing'),
      ('/admin/subscribers', 'marketing'),
      ('/admin/leads', 'marketing'),
      ('/admin/reports/marketing', 'marketing'),
      ('/admin/marketing/loyalty', 'marketing'),
      ('/admin/settings', 'settings'),
      ('/admin/settings/system', 'settings'),
      ('/admin/team', 'settings'),
      ('/admin/roles', 'settings'),
      ('/admin/audit-logs', 'settings'),
      ('/admin/settings/domain', 'custom_domain'),
      ('/admin/settings/currencies', 'currencies'),
      ('/admin/settings/social', 'social_links'),
      ('/admin/settings/trust', 'trust_safety'),
      ('/admin/settings/marketing', 'seo'),
      ('/admin/settings/label', 'label_config'),
      ('/admin/settings/organization', 'organization'),
      ('/admin/settings/email', 'email'),
      ('/admin/settings/sms', 'sms'),
      ('/admin/settings/payment', 'payment_settings'),
      ('/admin/settings/courier', 'courier'),
      ('/admin/settings/navbar', 'header'),
      ('/admin/settings/footer', 'footer'),
      ('/admin/settings/productsPage', 'product_list_ui'),
      ('/admin/settings/singleProductPage', 'product_detail_ui'),
      ('/admin/settings/offersPage', 'offers_page_ui'),
      ('/admin/reports', 'reports'),
      ('/admin/reports/sales', 'reports'),
      ('/admin/reports/warehouse-stock', 'reports'),
      ('/admin/reports/finance', 'reports'),
      ('/admin/reports/profit-loss', 'reports'),
      ('/admin/reports/supplier-ledger', 'reports'),
      ('/admin/reports/customer-ledger', 'reports'),
      ('/admin/reports/cash-flow', 'reports'),
      ('/admin/reports/export', 'reports'),
      ('/admin/logistics', 'logistics'),
      ('/admin/fulfillment', 'logistics'),
      ('/admin/couriers', 'logistics'),
      ('/admin/pages', 'content'),
      ('/admin/faqs', 'content'),
      ('/admin/profile', 'settings'),
      ('/admin', 'settings'),
      ('/admin/settings/general', 'settings'),
      ('staff_accounts', 'hrm'),
      ('unlimited_products', 'catalog'),
      ('advanced_analytics', 'reports');
    `)

    // 3. Update existing tenant_features to map to the new abstract slug
    await queryRunner.query(`
      UPDATE tenant_features tf
      SET feature_slug = m.new_slug
      FROM feature_slug_mapping m
      WHERE tf.feature_slug = m.old_slug;
    `)

    // 4. Resolve duplicates (e.g. if category and product were both mapped to catalog)
    // If any duplicate for a tenant was disabled, disable the merged abstract feature
    await queryRunner.query(`
      UPDATE tenant_features tf
      SET is_enabled = false
      WHERE EXISTS (
        SELECT 1 FROM tenant_features tf2
        WHERE tf2.tenant_id = tf.tenant_id
          AND tf2.feature_slug = tf.feature_slug
          AND tf2.is_enabled = false
          AND tf2.id <> tf.id
      );
    `)

    // 5. Delete duplicate entries, keeping only one entry per tenant and feature
    await queryRunner.query(`
      DELETE FROM tenant_features tf
      WHERE tf.id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY tenant_id, feature_slug ORDER BY id) as row_num
          FROM tenant_features
        ) t
        WHERE t.row_num > 1
      );
    `)

    // 6. Drop mapping table
    await queryRunner.query(`
      DROP TABLE feature_slug_mapping;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Migration down is not strictly necessary for this data restructuring, but we define an empty down to satisfy TypeORM
  }
}
