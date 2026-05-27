CREATE TEMP TABLE feature_slug_mapping (
  old_slug varchar NOT NULL,
  new_slug varchar NOT NULL
);

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

-- Create resolved features
CREATE TEMP TABLE resolved_features AS
SELECT 
  gen_random_uuid() as id,
  tf.tenant_id,
  m.new_slug as feature_slug,
  bool_and(tf.is_enabled) as is_enabled,
  NULL::uuid as enabled_by,
  NULL::timestamptz as enabled_at,
  MIN(tf.created_at) as created_at,
  MAX(tf.updated_at) as updated_at
FROM tenant_features tf
JOIN feature_slug_mapping m ON tf.feature_slug = m.old_slug
GROUP BY tf.tenant_id, m.new_slug;

-- Delete old records
DELETE FROM tenant_features tf
WHERE EXISTS (
  SELECT 1 FROM feature_slug_mapping m
  WHERE tf.feature_slug = m.old_slug
);

-- Insert new resolved records
INSERT INTO tenant_features (id, tenant_id, feature_slug, is_enabled, enabled_by, enabled_at, created_at, updated_at)
SELECT id, tenant_id, feature_slug, is_enabled, enabled_by, enabled_at, created_at, updated_at
FROM resolved_features
ON CONFLICT (tenant_id, feature_slug) DO UPDATE
SET is_enabled = EXCLUDED.is_enabled AND tenant_features.is_enabled,
    updated_at = NOW();

-- Clean up
DROP TABLE resolved_features;
DROP TABLE feature_slug_mapping;
