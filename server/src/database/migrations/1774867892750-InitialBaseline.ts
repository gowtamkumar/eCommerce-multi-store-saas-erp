import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialBaseline1774867892750 implements MigrationInterface {
  name = 'InitialBaseline1774867892750'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_plans_billing_cycle_enum" AS ENUM('monthly', 'yearly')`,
    )
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL DEFAULT '0', "billing_cycle" "public"."subscription_plans_billing_cycle_enum" NOT NULL DEFAULT 'monthly', "features" jsonb NOT NULL DEFAULT '[]', "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid, CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."tenants_custom_domain_status_enum" AS ENUM('pending', 'verified', 'active')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."tenants_status_enum" AS ENUM('active', 'suspended', 'archived', 'expired')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."tenants_subscription_billing_cycle_enum" AS ENUM('monthly', 'yearly')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."tenants_subscription_status_enum" AS ENUM('active', 'past_due', 'canceled', 'expired')`,
    )
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "store_name" character varying NOT NULL, "subdomain" character varying NOT NULL, "custom_domain" character varying, "custom_domain_status" "public"."tenants_custom_domain_status_enum" NOT NULL DEFAULT 'pending', "custom_domain_verified_at" TIMESTAMP WITH TIME ZONE, "status" "public"."tenants_status_enum" NOT NULL DEFAULT 'active', "ssl_enabled" boolean NOT NULL DEFAULT false, "subscription_plan_id" uuid, "subscription_billing_cycle" "public"."tenants_subscription_billing_cycle_enum" NOT NULL DEFAULT 'monthly', "subscription_status" "public"."tenants_subscription_status_enum" NOT NULL DEFAULT 'active', "subscription_starts_at" TIMESTAMP WITH TIME ZONE, "subscription_ends_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid, CONSTRAINT "UQ_21bb89e012fa5b58532009c1601" UNIQUE ("subdomain"), CONSTRAINT "UQ_c985fa3986f7383dff567479e5d" UNIQUE ("custom_domain"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'operator', 'user', 'super_admin', 'store_manager', 'support', 'marketing')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'blocked')`,
    )
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "email" character varying, "username" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying, "address" text, "image" character varying, "is_admin" boolean NOT NULL DEFAULT false, "is_email_verified" boolean NOT NULL DEFAULT false, "email_verification_token" character varying, "reset_password_token" character varying, "reset_password_expires" TIMESTAMP WITH TIME ZONE, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "refresh_token" character varying, "tenant_id" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e9f4c2efab52114c4e99e28efb" ON "users" ("email", "tenant_id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_52a29f8fc340e73d124af517f2" ON "users" ("username", "tenant_id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "tenant_traffic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "date" date NOT NULL, "request_count" integer NOT NULL DEFAULT '0', "last_updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_a95e4df16abc74c950152d7fff7" UNIQUE ("tenant_id", "date"), CONSTRAINT "PK_964cb6b12e433147b9525500a12" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_invoices_status_enum" AS ENUM('pending', 'paid', 'failed', 'completed')`,
    )
    await queryRunner.query(
      `CREATE TABLE "subscription_invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "invoice_number" character varying(100) NOT NULL, "tenant_id" uuid NOT NULL, "subscription_plan_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "status" "public"."subscription_invoices_status_enum" NOT NULL DEFAULT 'pending', "transaction_id" character varying, "billing_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "payment_url" text, "gateway_response" jsonb, CONSTRAINT "UQ_6c62b1deceda54a99b61dec8857" UNIQUE ("invoice_number"), CONSTRAINT "PK_7050ae7d81f0f0207b8f1cd2efc" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "platform_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "brand_name" character varying, "brand_logo" character varying, "support_email" character varying, "hero" jsonb, "features" jsonb, "footer" jsonb, "user_id" uuid, CONSTRAINT "PK_2934aeb70ec285196dcab4a2e96" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "user_id" uuid, "action" character varying(100) NOT NULL, "entity" character varying(100) NOT NULL, "entity_id" character varying(255), "old_value" jsonb, "new_value" jsonb, "ip_address" character varying(45), "user_agent" text, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_200e5746777e616b84e6c7ad63" ON "audit_logs" ("tenant_id", "user_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_4cc30fe1cdd5088a8e361f8af7" ON "audit_logs" ("tenant_id", "entity", "entity_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_898d14750b88319b89b1ab66cd" ON "audit_logs" ("tenant_id", "created_at") `,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."reviews_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    )
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "product_id" uuid NOT NULL, "customer_name" character varying(255) NOT NULL, "customer_email" character varying(255) NOT NULL, "rating" integer NOT NULL DEFAULT '5', "comment" text NOT NULL, "status" "public"."reviews_status_enum" NOT NULL DEFAULT 'pending', "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_aa17633b6f91f0856429b1ed0e" ON "reviews" ("product_id", "status") `,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."pages_status_enum" AS ENUM('draft', 'published')`,
    )
    await queryRunner.query(
      `CREATE TABLE "pages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL DEFAULT '', "is_home_page" boolean NOT NULL DEFAULT false, "order" integer NOT NULL DEFAULT '0', "sections" jsonb, "meta_title" character varying(255), "meta_description" text, "og_image" character varying(500), "typography" jsonb, "status" "public"."pages_status_enum" NOT NULL DEFAULT 'published', "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8b5bb3a42b7798ad7feff4e7d5" ON "pages" ("slug", "tenant_id") `,
    )
    await queryRunner.query(`CREATE TYPE "public"."faqs_status_enum" AS ENUM('active', 'inactive')`)
    await queryRunner.query(
      `CREATE TABLE "faqs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "question" text NOT NULL, "answer" text NOT NULL, "category" character varying(100) NOT NULL DEFAULT 'General', "order" integer NOT NULL DEFAULT '0', "status" "public"."faqs_status_enum" NOT NULL DEFAULT 'active', "tenant_id" uuid NOT NULL, "product_id" uuid, "page_id" uuid, "user_id" uuid, CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "contact_name" character varying(255), "email" character varying(255), "phone" character varying(50), "address" text, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "image" character varying, "website" character varying, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "image" character varying(500), "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "product_attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(100) NOT NULL, "values" text NOT NULL, "product_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_4fa18fc5c893cb9894fc40ca921" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "sku" character varying(255) NOT NULL, "price" numeric(10,2), "stock" integer NOT NULL DEFAULT '0', "low_stock_threshold" integer NOT NULL DEFAULT '5', "images" text, "combination" jsonb NOT NULL, "product_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."products_discount_type_enum" AS ENUM('percentage', 'fixed', 'free_shipping')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('active', 'inactive')`,
    )
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text NOT NULL, "short_description" text, "price" numeric(10,2) NOT NULL, "is_review" boolean NOT NULL DEFAULT true, "discount_amount" numeric(10,2) NOT NULL DEFAULT '0', "discount_type" "public"."products_discount_type_enum" DEFAULT 'percentage', "tax_rate" numeric(5,2) DEFAULT '0', "images" text NOT NULL, "stock" integer NOT NULL DEFAULT '0', "low_stock_threshold" integer NOT NULL DEFAULT '5', "status" "public"."products_status_enum" NOT NULL DEFAULT 'inactive', "category_id" uuid, "brand_id" uuid, "landing_page_id" uuid, "faq_source" character varying(50) NOT NULL DEFAULT 'manual', "faq_ids" text, "supplier_id" uuid, "tenant_id" uuid NOT NULL, "user_id" uuid, "meta_title" character varying(255), "meta_description" text, "og_image" character varying(500), "is_new" boolean NOT NULL DEFAULT false, "is_hot" boolean NOT NULL DEFAULT false, "is_sale" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(`CREATE INDEX "IDX_464f927ae360106b783ed0b410" ON "products" ("slug") `)
    await queryRunner.query(
      `CREATE INDEX "IDX_9a5f6868c96e0069e699f33e12" ON "products" ("category_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_1530a6f15d3c79d1b70be98f2b" ON "products" ("brand_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_9c365ebf78f0e8a6d9e4827ea7" ON "products" ("tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_176b502c5ebd6e72cafbd9d6f7" ON "products" ("user_id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "wishlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid NOT NULL, "product_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, CONSTRAINT "PK_d0a37f2848c5d268d315325f359" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d1e5aa828aec675770f3f435bd" ON "wishlists" ("user_id", "product_id", "tenant_id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "cart_id" uuid NOT NULL, "product_id" uuid NOT NULL, "variant_id" uuid, "quantity" integer NOT NULL DEFAULT '1', "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "applied_coupon_code" character varying(50), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."shipping_addresses_zone_enum" AS ENUM('inside', 'outside')`,
    )
    await queryRunner.query(
      `CREATE TABLE "shipping_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "label" character varying(100), "recipient_name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "address" text NOT NULL, "city" character varying(100), "zone" "public"."shipping_addresses_zone_enum", "is_default" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cced78984eddbbe24470f226692" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "site_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "logo" character varying, "brand_name" character varying, "site_description" character varying, "contact_email" character varying, "contact_phone" character varying, "whatsapp_phone" character varying, "address" character varying, "currency" character varying, "currency_symbol" character varying, "supported_currencies" jsonb, "social_links" jsonb, "marketing" jsonb, "smtp" jsonb, "payment" jsonb, "pathao_courier" jsonb, "steadfast_courier" jsonb, "shipping_config" jsonb, "navbar" jsonb, "footer" jsonb, "trust_badges" jsonb, "products_page" jsonb, "single_product_page" jsonb, "offers_page" jsonb, "robots_txt" text, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."promotions_promotiontype_enum" AS ENUM('percentage', 'fixed', 'free_shipping')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."promotions_targettype_enum" AS ENUM('entire_order', 'specific_product', 'specific_category', 'specific_brand', 'minimum_cart_value')`,
    )
    await queryRunner.query(
      `CREATE TABLE "promotions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "slug" character varying NOT NULL, "description" text, "promotionType" "public"."promotions_promotiontype_enum" NOT NULL DEFAULT 'percentage', "value" numeric(10,2), "targetType" "public"."promotions_targettype_enum" NOT NULL DEFAULT 'entire_order', "target_id" uuid, "min_order_value" numeric(10,2), "start_date" TIMESTAMP, "end_date" TIMESTAMP, "is_active" boolean NOT NULL DEFAULT true, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "UQ_dbea049b681d15564f46dd7bdee" UNIQUE ("slug"), CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "variant_id" uuid, "snapshot" jsonb, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "discount_amount" numeric(10,2) NOT NULL DEFAULT '0', "tax_amount" numeric(10,2) NOT NULL DEFAULT '0', "total_amount" numeric(10,2) NOT NULL, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."order_returns_status_enum" AS ENUM('pending', 'approved', 'rejected', 'refunded')`,
    )
    await queryRunner.query(
      `CREATE TABLE "order_returns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "order_id" uuid NOT NULL, "user_id" uuid NOT NULL, "status" "public"."order_returns_status_enum" NOT NULL DEFAULT 'pending', "reason" text NOT NULL, "admin_comment" text, "refund_amount" numeric(10,2), "items" jsonb NOT NULL, "tenant_id" uuid NOT NULL, CONSTRAINT "PK_579752300589723ade9af5f1122" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_method_enum" AS ENUM('cod', 'sslcommerz')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'completed')`,
    )
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "customer_name" character varying(255) NOT NULL, "customer_email" character varying(255) NOT NULL, "customer_phone" character varying(50) NOT NULL, "address" text NOT NULL, "shipping_address_id" uuid, "total_amount" numeric(10,2) NOT NULL, "shipping_fee" numeric(10,2) NOT NULL DEFAULT '0', "currency" character varying(10) NOT NULL DEFAULT 'BDT', "currency_rate" numeric(10,4) NOT NULL DEFAULT '1', "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "payment_method" "public"."orders_payment_method_enum" NOT NULL, "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'pending', "transaction_id" character varying(255), "order_notes" text, "user_id" uuid NOT NULL, "tenant_id" uuid NOT NULL, "tracking_id" character varying(255), "courier_status" character varying(255), "applied_coupon" character varying(50), "coupon_discount_amount" numeric(10,2) NOT NULL DEFAULT '0', "tax_amount" numeric(10,2) NOT NULL DEFAULT '0', "delivery_zone" character varying(50), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."payments_method_enum" AS ENUM('cod', 'sslcommerz')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'paid', 'failed', 'completed')`,
    )
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "order_id" uuid NOT NULL, "user_id" uuid, "transaction_id" character varying(255) NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'BDT', "method" "public"."payments_method_enum" NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "gateway_response" jsonb, "tenant_id" uuid NOT NULL, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."coupons_discounttype_enum" AS ENUM('percentage', 'fixed', 'free_shipping')`,
    )
    await queryRunner.query(
      `CREATE TABLE "coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "code" character varying(50) NOT NULL, "description" character varying(255), "discountType" "public"."coupons_discounttype_enum" NOT NULL DEFAULT 'percentage', "amount" numeric(10,2) NOT NULL, "min_purchase_amount" numeric(10,2) NOT NULL DEFAULT '0', "start_date" TIMESTAMP, "expiry_date" TIMESTAMP, "usage_limit" integer, "used_count" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_transactions_type_enum" AS ENUM('in', 'out')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_transactions_reference_type_enum" AS ENUM('order', 'purchase', 'adjustment', 'initial')`,
    )
    await queryRunner.query(
      `CREATE TABLE "inventory_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "product_id" uuid NOT NULL, "variant_id" uuid, "supplier_id" uuid, "type" "public"."inventory_transactions_type_enum" NOT NULL, "quantity" integer NOT NULL, "reference_type" "public"."inventory_transactions_reference_type_enum" NOT NULL, "reference_id" character varying(255), "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_9b7144851f08f9eededde7edd42" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "fieldname" character varying NOT NULL, "originalname" character varying, "encoding" character varying, "mimetype" character varying, "destination" character varying, "filename" character varying, "pdf_file" character varying, "path" character varying, "size" integer, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "purchase_order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "purchase_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "variant_id" uuid, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "user_id" uuid, CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_orders_status_enum" AS ENUM('draft', 'pending', 'received', 'cancelled')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_orders_payment_status_enum" AS ENUM('pending', 'partial', 'paid')`,
    )
    await queryRunner.query(
      `CREATE TABLE "purchase_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "reference_number" character varying(255) NOT NULL, "supplier_id" uuid NOT NULL, "status" "public"."purchase_orders_status_enum" NOT NULL DEFAULT 'draft', "total_amount" numeric(10,2) NOT NULL DEFAULT '0', "payment_status" "public"."purchase_orders_payment_status_enum" NOT NULL DEFAULT 'pending', "paid_amount" numeric(10,2) NOT NULL DEFAULT '0', "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "supplier_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "purchase_order_id" uuid NOT NULL, "supplier_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "payment_date" TIMESTAMP NOT NULL DEFAULT now(), "payment_method" character varying(50) NOT NULL, "transaction_id" character varying(255), "note" text, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_76e86f3194494faf999c652dbf9" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_status_enum" AS ENUM('pending', 'paid', 'overdue', 'cancelled')`,
    )
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "invoice_number" character varying(100) NOT NULL, "order_id" uuid NOT NULL, "issue_date" date NOT NULL, "due_date" date, "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'pending', "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE ("invoice_number"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."expenses_category_enum" AS ENUM('shipping', 'packaging', 'marketing', 'software', 'salaries', 'utilities', 'maintenance', 'other')`,
    )
    await queryRunner.query(
      `CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "description" text, "amount" numeric(10,2) NOT NULL, "expense_date" date NOT NULL, "category" "public"."expenses_category_enum" NOT NULL DEFAULT 'other', "reference_number" character varying(100), "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "subscribers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid, CONSTRAINT "UQ_1a7163c08f0e57bd1c9821508b1" UNIQUE ("email"), CONSTRAINT "PK_cbe0a7a9256c826f403c0236b67" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."leads_status_enum" AS ENUM('new', 'contacted', 'converted')`,
    )
    await queryRunner.query(
      `CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255), "email" character varying(255) NOT NULL, "phone" character varying(50), "address" text, "subject" character varying(255), "message" text, "status" "public"."leads_status_enum" NOT NULL DEFAULT 'new', "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."staff_invitations_role_enum" AS ENUM('admin', 'operator', 'user', 'super_admin', 'store_manager', 'support', 'marketing')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."staff_invitations_status_enum" AS ENUM('pending', 'accepted', 'expired')`,
    )
    await queryRunner.query(
      `CREATE TABLE "staff_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "role" "public"."staff_invitations_role_enum" NOT NULL DEFAULT 'operator', "tenant_id" uuid NOT NULL, "token" character varying NOT NULL, "status" "public"."staff_invitations_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "invited_by" uuid, CONSTRAINT "UQ_4e6e40d4c9c24f41c1067b55140" UNIQUE ("token"), CONSTRAINT "PK_842e5346c92d8003bdb2140b6c8" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ADD CONSTRAINT "FK_f06b516e6bdc44a370ca7d69a0e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD CONSTRAINT "FK_84279188abf7dad6cb6fe2e3d9c" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD CONSTRAINT "FK_0e2bb90ad27fa92910185792aca" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenant_traffic" ADD CONSTRAINT "FK_718255c609f0cf64754afc09b66" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" ADD CONSTRAINT "FK_2a5257dfb60f446b19c287f416d" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" ADD CONSTRAINT "FK_15c466d30506fda5b2b1bbf2461" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "platform_settings" ADD CONSTRAINT "FK_637c1fee01f70e1a7eb00261ac8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_bfb7f35d7db2b7afc40811c1925" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "pages" ADD CONSTRAINT "FK_46e907ed4e2f32850168d175571" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "pages" ADD CONSTRAINT "FK_98ceb5433a66707b9c649503dce" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "faqs" ADD CONSTRAINT "FK_69e7c84542b637b399d0a88f9c6" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "faqs" ADD CONSTRAINT "FK_9c6a424c26fe0cf898e550189ed" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "faqs" ADD CONSTRAINT "FK_bb9d426714c53bfde1bb2738b6f" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "faqs" ADD CONSTRAINT "FK_efa33cfbfffe5e5ddf10b8360ef" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "suppliers" ADD CONSTRAINT "FK_b0d0350059126fa08fddc3c7a46" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "suppliers" ADD CONSTRAINT "FK_b3aba33228acd59f2d734c31b82" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "FK_33bb5b1b1a3a7e8b9787cd87784" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "FK_5d26f3a7d19d380538c9dd57d06" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_5d4fe23b360b1b9e16a3f41727f" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_2cf0031fe3f0a6a5e9085f390fe" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_e96e3e3799fe4b21ad07b3b3cff" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_0ec433c1e1d444962d592d86c86" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9c365ebf78f0e8a6d9e4827ea70" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_176b502c5ebd6e72cafbd9d6f70" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_b5e6331a1a7d61c25d7a25cab8f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_2662acbb3868b1f0077fda61dd2" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_1a697e458e79055b7fc3ff0e8e0" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_6385a745d9e12a89b859bb25623" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_ede780fc2b865d1d1323e598038" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_a1eb449d8def14d83cf82066f94" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_b7213c20c1ecdc6597abc8f1212" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_846bcf9b09d81d7e8b67096ef38" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD CONSTRAINT "FK_ae904a1632fb292b94b7c645715" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD CONSTRAINT "FK_e3c0b0f92d46ec87d2aedb08955" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD CONSTRAINT "FK_f8bcbc3a412f82f76f493769a98" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD CONSTRAINT "FK_6b9285677a2fa46c96d6f88e9fd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_db2d0ea722e16e0fe8ab3bce111" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_89dd5f9a3e63caf2e5f4ea85fac" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_bf96e1bdbc1ce2ec1f7fe66e8c2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_returns" ADD CONSTRAINT "FK_bcd8e1a275860e70f3a876d718f" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_returns" ADD CONSTRAINT "FK_a511b1124729b644c1c26cbb098" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_returns" ADD CONSTRAINT "FK_c8fafcb69df5d7aaa71e26afe57" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_67b8be57fc38bda573d2a8513ec" FOREIGN KEY ("shipping_address_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_527dd6efd5f3402f729c6b3e826" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_b2f7b823a21562eeca20e72b006" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_9109b53fca5cef7720aca72974d" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD CONSTRAINT "FK_169338eead44e81c390fbc64626" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD CONSTRAINT "FK_9974c02e617aa96ddafd8404323" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_2520d97de0c9a0fbfc9b00f4c1b" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_aeb0f3a59ed2fd95e1a13097eda" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_dde701f3b756ac6ad4040ecb551" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_d84016219a197827a82e178881c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_e51672a4898b02f686769f71c2a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_3f92bb44026cedfe235c8b91244" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_d5089517fc19b1b9fb04454740c" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_c7a528a540ba57bfc7bac43109b" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_33d621ab2004ace0d32a966e250" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_237678c98436e0abb48b3060c82" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_c13036093717212c2c6aa111c73" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "supplier_payments" ADD CONSTRAINT "FK_5e3f9443818b705f6ab86b44764" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "supplier_payments" ADD CONSTRAINT "FK_220694212ec38b4aa2fb02ed622" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "supplier_payments" ADD CONSTRAINT "FK_b1c9c7f6f733b3a8a3501b0cb80" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "supplier_payments" ADD CONSTRAINT "FK_99283b63c5ce97cf7a4dcc08808" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_ea83c3b911906a3578de2340fdf" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_440f531f452dcc4389d201b9d4b" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_e86e6bebe054a040132d2aeb5bc" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_49a0ca239d34e74fdc4e0625a78" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscribers" ADD CONSTRAINT "FK_0c99e87bda40ab7c44e49e88ef8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_2440046dd05066e882bb68a780c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "leads" ADD CONSTRAINT "FK_0cec49f8f07d5ac4a8a9bbe6ac2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_0cec49f8f07d5ac4a8a9bbe6ac2"`)
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_2440046dd05066e882bb68a780c"`)
    await queryRunner.query(
      `ALTER TABLE "subscribers" DROP CONSTRAINT "FK_0c99e87bda40ab7c44e49e88ef8"`,
    )
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_49a0ca239d34e74fdc4e0625a78"`,
    )
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_e86e6bebe054a040132d2aeb5bc"`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637"`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_440f531f452dcc4389d201b9d4b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_ea83c3b911906a3578de2340fdf"`,
    )
    await queryRunner.query(
      `ALTER TABLE "supplier_payments" DROP CONSTRAINT "FK_99283b63c5ce97cf7a4dcc08808"`,
    )
    await queryRunner.query(
      `ALTER TABLE "supplier_payments" DROP CONSTRAINT "FK_b1c9c7f6f733b3a8a3501b0cb80"`,
    )
    await queryRunner.query(
      `ALTER TABLE "supplier_payments" DROP CONSTRAINT "FK_220694212ec38b4aa2fb02ed622"`,
    )
    await queryRunner.query(
      `ALTER TABLE "supplier_payments" DROP CONSTRAINT "FK_5e3f9443818b705f6ab86b44764"`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_c13036093717212c2c6aa111c73"`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_237678c98436e0abb48b3060c82"`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_d16a885aa88447ccfd010e739b0"`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_33d621ab2004ace0d32a966e250"`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_c7a528a540ba57bfc7bac43109b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_d5089517fc19b1b9fb04454740c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_3f92bb44026cedfe235c8b91244"`,
    )
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_a7435dbb7583938d5e7d1376041"`)
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_e51672a4898b02f686769f71c2a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_d84016219a197827a82e178881c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_dde701f3b756ac6ad4040ecb551"`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_aeb0f3a59ed2fd95e1a13097eda"`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_2520d97de0c9a0fbfc9b00f4c1b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP CONSTRAINT "FK_9974c02e617aa96ddafd8404323"`,
    )
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP CONSTRAINT "FK_169338eead44e81c390fbc64626"`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_9109b53fca5cef7720aca72974d"`,
    )
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_b2f7b823a21562eeca20e72b006"`,
    )
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_527dd6efd5f3402f729c6b3e826"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_67b8be57fc38bda573d2a8513ec"`)
    await queryRunner.query(
      `ALTER TABLE "order_returns" DROP CONSTRAINT "FK_c8fafcb69df5d7aaa71e26afe57"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_returns" DROP CONSTRAINT "FK_a511b1124729b644c1c26cbb098"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_returns" DROP CONSTRAINT "FK_bcd8e1a275860e70f3a876d718f"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_bf96e1bdbc1ce2ec1f7fe66e8c2"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_89dd5f9a3e63caf2e5f4ea85fac"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_db2d0ea722e16e0fe8ab3bce111"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`,
    )
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP CONSTRAINT "FK_6b9285677a2fa46c96d6f88e9fd"`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP CONSTRAINT "FK_f8bcbc3a412f82f76f493769a98"`,
    )
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP CONSTRAINT "FK_e3c0b0f92d46ec87d2aedb08955"`,
    )
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP CONSTRAINT "FK_ae904a1632fb292b94b7c645715"`,
    )
    await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_846bcf9b09d81d7e8b67096ef38"`)
    await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea"`)
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_b7213c20c1ecdc6597abc8f1212"`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_a1eb449d8def14d83cf82066f94"`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_ede780fc2b865d1d1323e598038"`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_30e89257a105eab7648a35c7fce"`,
    )
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_6385a745d9e12a89b859bb25623"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_1a697e458e79055b7fc3ff0e8e0"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_2662acbb3868b1f0077fda61dd2"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_b5e6331a1a7d61c25d7a25cab8f"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_176b502c5ebd6e72cafbd9d6f70"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9c365ebf78f0e8a6d9e4827ea70"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_0ec433c1e1d444962d592d86c86"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_e96e3e3799fe4b21ad07b3b3cff"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_6343513e20e2deab45edfce1316"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_2cf0031fe3f0a6a5e9085f390fe"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_f5a6700abd0494bae3032cf5bbd"`,
    )
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_5d4fe23b360b1b9e16a3f41727f"`,
    )
    await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_5d26f3a7d19d380538c9dd57d06"`)
    await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_33bb5b1b1a3a7e8b9787cd87784"`)
    await queryRunner.query(
      `ALTER TABLE "suppliers" DROP CONSTRAINT "FK_b3aba33228acd59f2d734c31b82"`,
    )
    await queryRunner.query(
      `ALTER TABLE "suppliers" DROP CONSTRAINT "FK_b0d0350059126fa08fddc3c7a46"`,
    )
    await queryRunner.query(`ALTER TABLE "faqs" DROP CONSTRAINT "FK_efa33cfbfffe5e5ddf10b8360ef"`)
    await queryRunner.query(`ALTER TABLE "faqs" DROP CONSTRAINT "FK_bb9d426714c53bfde1bb2738b6f"`)
    await queryRunner.query(`ALTER TABLE "faqs" DROP CONSTRAINT "FK_9c6a424c26fe0cf898e550189ed"`)
    await queryRunner.query(`ALTER TABLE "faqs" DROP CONSTRAINT "FK_69e7c84542b637b399d0a88f9c6"`)
    await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_98ceb5433a66707b9c649503dce"`)
    await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_46e907ed4e2f32850168d175571"`)
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_bfb7f35d7db2b7afc40811c1925"`,
    )
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_9482e9567d8dcc2bc615981ef44"`,
    )
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7"`,
    )
    await queryRunner.query(
      `ALTER TABLE "platform_settings" DROP CONSTRAINT "FK_637c1fee01f70e1a7eb00261ac8"`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_15c466d30506fda5b2b1bbf2461"`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_2a5257dfb60f446b19c287f416d"`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenant_traffic" DROP CONSTRAINT "FK_718255c609f0cf64754afc09b66"`,
    )
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`)
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP CONSTRAINT "FK_0e2bb90ad27fa92910185792aca"`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP CONSTRAINT "FK_84279188abf7dad6cb6fe2e3d9c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" DROP CONSTRAINT "FK_f06b516e6bdc44a370ca7d69a0e"`,
    )
    await queryRunner.query(`DROP TABLE "staff_invitations"`)
    await queryRunner.query(`DROP TYPE "public"."staff_invitations_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."staff_invitations_role_enum"`)
    await queryRunner.query(`DROP TABLE "leads"`)
    await queryRunner.query(`DROP TYPE "public"."leads_status_enum"`)
    await queryRunner.query(`DROP TABLE "subscribers"`)
    await queryRunner.query(`DROP TABLE "expenses"`)
    await queryRunner.query(`DROP TYPE "public"."expenses_category_enum"`)
    await queryRunner.query(`DROP TABLE "invoices"`)
    await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`)
    await queryRunner.query(`DROP TABLE "supplier_payments"`)
    await queryRunner.query(`DROP TABLE "purchase_orders"`)
    await queryRunner.query(`DROP TYPE "public"."purchase_orders_payment_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."purchase_orders_status_enum"`)
    await queryRunner.query(`DROP TABLE "purchase_order_items"`)
    await queryRunner.query(`DROP TABLE "files"`)
    await queryRunner.query(`DROP TABLE "inventory_transactions"`)
    await queryRunner.query(`DROP TYPE "public"."inventory_transactions_reference_type_enum"`)
    await queryRunner.query(`DROP TYPE "public"."inventory_transactions_type_enum"`)
    await queryRunner.query(`DROP TABLE "coupons"`)
    await queryRunner.query(`DROP TYPE "public"."coupons_discounttype_enum"`)
    await queryRunner.query(`DROP TABLE "payments"`)
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`)
    await queryRunner.query(`DROP TABLE "orders"`)
    await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."orders_payment_method_enum"`)
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`)
    await queryRunner.query(`DROP TABLE "order_returns"`)
    await queryRunner.query(`DROP TYPE "public"."order_returns_status_enum"`)
    await queryRunner.query(`DROP TABLE "order_items"`)
    await queryRunner.query(`DROP TABLE "promotions"`)
    await queryRunner.query(`DROP TYPE "public"."promotions_targettype_enum"`)
    await queryRunner.query(`DROP TYPE "public"."promotions_promotiontype_enum"`)
    await queryRunner.query(`DROP TABLE "site_settings"`)
    await queryRunner.query(`DROP TABLE "shipping_addresses"`)
    await queryRunner.query(`DROP TYPE "public"."shipping_addresses_zone_enum"`)
    await queryRunner.query(`DROP TABLE "carts"`)
    await queryRunner.query(`DROP TABLE "cart_items"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_d1e5aa828aec675770f3f435bd"`)
    await queryRunner.query(`DROP TABLE "wishlists"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_176b502c5ebd6e72cafbd9d6f7"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_9c365ebf78f0e8a6d9e4827ea7"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_1530a6f15d3c79d1b70be98f2b"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_9a5f6868c96e0069e699f33e12"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_464f927ae360106b783ed0b410"`)
    await queryRunner.query(`DROP TABLE "products"`)
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."products_discount_type_enum"`)
    await queryRunner.query(`DROP TABLE "product_variants"`)
    await queryRunner.query(`DROP TABLE "product_attributes"`)
    await queryRunner.query(`DROP TABLE "categories"`)
    await queryRunner.query(`DROP TABLE "brands"`)
    await queryRunner.query(`DROP TABLE "suppliers"`)
    await queryRunner.query(`DROP TABLE "faqs"`)
    await queryRunner.query(`DROP TYPE "public"."faqs_status_enum"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8b5bb3a42b7798ad7feff4e7d5"`)
    await queryRunner.query(`DROP TABLE "pages"`)
    await queryRunner.query(`DROP TYPE "public"."pages_status_enum"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_aa17633b6f91f0856429b1ed0e"`)
    await queryRunner.query(`DROP TABLE "reviews"`)
    await queryRunner.query(`DROP TYPE "public"."reviews_status_enum"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_898d14750b88319b89b1ab66cd"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_4cc30fe1cdd5088a8e361f8af7"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_200e5746777e616b84e6c7ad63"`)
    await queryRunner.query(`DROP TABLE "audit_logs"`)
    await queryRunner.query(`DROP TABLE "platform_settings"`)
    await queryRunner.query(`DROP TABLE "subscription_invoices"`)
    await queryRunner.query(`DROP TYPE "public"."subscription_invoices_status_enum"`)
    await queryRunner.query(`DROP TABLE "tenant_traffic"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_52a29f8fc340e73d124af517f2"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e9f4c2efab52114c4e99e28efb"`)
    await queryRunner.query(`DROP TABLE "users"`)
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`)
    await queryRunner.query(`DROP TABLE "tenants"`)
    await queryRunner.query(`DROP TYPE "public"."tenants_subscription_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."tenants_subscription_billing_cycle_enum"`)
    await queryRunner.query(`DROP TYPE "public"."tenants_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."tenants_custom_domain_status_enum"`)
    await queryRunner.query(`DROP TABLE "subscription_plans"`)
    await queryRunner.query(`DROP TYPE "public"."subscription_plans_billing_cycle_enum"`)
  }
}
