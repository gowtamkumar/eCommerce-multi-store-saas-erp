import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTenantIdToSubscriber1775728766873 implements MigrationInterface {
  name = 'AddTenantIdToSubscriber1775728766873'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add column as nullable initially
    await queryRunner.query(`ALTER TABLE "subscribers" ADD "tenant_id" uuid`)

    // Step 2: Assign existing rows to a valid tenant
    await queryRunner.query(
      `UPDATE "subscribers" SET "tenant_id" = '7f8b8b58-8659-4638-af2e-587bb9e82835' WHERE "tenant_id" IS NULL`,
    )

    // Step 3: Enforce NOT NULL constraint
    await queryRunner.query(`ALTER TABLE "subscribers" ALTER COLUMN "tenant_id" SET NOT NULL`)

    await queryRunner.query(
      `ALTER TABLE "subscribers" DROP CONSTRAINT "UQ_1a7163c08f0e57bd1c9821508b1"`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_109638590074998bb72a2f2cf0" ON "users" ("tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_b66f30bdb828384bad81071007" ON "reviews" ("tenant_id", "status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_e9cb84fd8d4bca16c52818155b" ON "pages" ("tenant_id", "is_home_page") `,
    )
    await queryRunner.query(`CREATE INDEX "IDX_3816a9b513ab119616229d3356" ON "faqs" ("order") `)
    await queryRunner.query(`CREATE INDEX "IDX_ec69ef8e48f54e2b8899131c86" ON "faqs" ("status") `)
    await queryRunner.query(
      `CREATE INDEX "IDX_69e7c84542b637b399d0a88f9c" ON "faqs" ("tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_d22fbd5ac43b8fdc54f60cfdb9" ON "faqs" ("tenant_id", "page_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_f1256cfc368e9645fd5800cf28" ON "faqs" ("tenant_id", "product_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_04881b33675e7ddf92129b64b8" ON "faqs" ("tenant_id", "status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_66181e465a65c2ddcfa9c00c9c" ON "suppliers" ("email") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_b3aba33228acd59f2d734c31b8" ON "suppliers" ("user_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_3c65399d58c2822d294f2d2d2b" ON "suppliers" ("tenant_id", "name") `,
    )
    await queryRunner.query(`CREATE INDEX "IDX_b15428f362be2200922952dc26" ON "brands" ("slug") `)
    await queryRunner.query(
      `CREATE INDEX "IDX_33bb5b1b1a3a7e8b9787cd8778" ON "brands" ("tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_63db05d5bb2f8dd831ed655021" ON "categories" ("tenant_id", "slug") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_553196ea54b383f352401962af" ON "product_variants" ("tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_6343513e20e2deab45edfce131" ON "product_variants" ("product_id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2018133f9c98a1f0783df9dec8" ON "product_variants" ("sku", "tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_6fab7980dee7f667919aa5e635" ON "products" ("tenant_id", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_22ad5445514d484d9a67095b59" ON "products" ("tenant_id", "status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_995d8194c43edfc98838cabc5a" ON "products" ("created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_1846199852a695713b1f8f5e9a" ON "products" ("status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_a1eb449d8def14d83cf82066f9" ON "cart_items" ("tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_6385a745d9e12a89b859bb2562" ON "cart_items" ("cart_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_101cb71b62ea2d4e9cc56ab54d" ON "carts" ("user_id", "tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ee2f108dd2b132b4b225f6cf0e" ON "promotions" ("tenant_id", "slug") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_114cc380ce4148ae166ab38b30" ON "promotions" ("tenant_id", "is_active", "start_date", "end_date") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_bcd8e1a275860e70f3a876d718" ON "order_returns" ("order_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_30bb2773875fbf546ec501e80a" ON "order_returns" ("tenant_id", "status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_59b7a79203c34cf04826d76b8b" ON "orders" ("tenant_id", "status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_cd5e019c76a79a59e9188d2aae" ON "orders" ("tenant_id", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_3c324ca49dabde7ffc0ef64675" ON "payments" ("transaction_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_9e37be5051b435614120c03fea" ON "payments" ("tenant_id", "status", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_6c039ced2230e9c06f2a872000" ON "payments" ("tenant_id", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_d53f91f073c6732c75b8204369" ON "coupons" ("tenant_id", "is_active", "expiry_date") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b9450a13a4299d264c9e53fb80" ON "coupons" ("tenant_id", "code") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_2520d97de0c9a0fbfc9b00f4c1" ON "inventory_transactions" ("product_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_aeb0f3a59ed2fd95e1a13097ed" ON "inventory_transactions" ("variant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_f547886ce56d6470806b4606f5" ON "inventory_transactions" ("type") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_5f85e22b78c1d8681ceca05e69" ON "inventory_transactions" ("tenant_id", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_134735cc45672b90b366c20dc3" ON "files" ("filename") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_484acb2ff8f3e134dfac8f01e8" ON "files" ("tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_3f92bb44026cedfe235c8b9124" ON "purchase_order_items" ("purchase_order_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_abc255cfe0b1f3068a61b6c4a5" ON "purchase_orders" ("reference_number") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_d16a885aa88447ccfd010e739b" ON "purchase_orders" ("supplier_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_5272ac3aa931eedb14cd8789d6" ON "purchase_orders" ("status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_eb42e8a25edaa6a06096d6df05" ON "purchase_orders" ("payment_status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_8cba26b24bbea7cff67a6f6f75" ON "purchase_orders" ("tenant_id", "status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_1230ebe7ada6874d51ae7cc7e9" ON "purchase_orders" ("tenant_id", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ea83c3b911906a3578de2340fd" ON "invoices" ("order_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ac0f09364e3701d9ed35435288" ON "invoices" ("status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_26daf5e433d6fb88ee32ce9363" ON "invoices" ("user_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_701ba9039b36234c51b66a23b5" ON "invoices" ("tenant_id", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_96cb9079b02fd51caaf18a417a" ON "expenses" ("tenant_id", "category") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_2ba8f6cfe0b7273b7b02c4eb32" ON "expenses" ("tenant_id", "expense_date") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_b97323410523f74139fbd6a84e" ON "subscribers" ("tenant_id") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ab49c86b738822028b47a8fd14" ON "subscribers" ("created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_06faa5bf9f2eb5de43a60a77a6" ON "leads" ("tenant_id", "status", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_d0ed38c8f82903c6b83c7922f5" ON "leads" ("tenant_id", "created_at") `,
    )
    await queryRunner.query(
      `ALTER TABLE "subscribers" ADD CONSTRAINT "UQ_09f9f571635df2421b2f2c6799b" UNIQUE ("tenant_id", "email")`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscribers" ADD CONSTRAINT "FK_b97323410523f74139fbd6a84e0" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscribers" DROP CONSTRAINT "FK_b97323410523f74139fbd6a84e0"`,
    )
    await queryRunner.query(
      `ALTER TABLE "subscribers" DROP CONSTRAINT "UQ_09f9f571635df2421b2f2c6799b"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_d0ed38c8f82903c6b83c7922f5"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_06faa5bf9f2eb5de43a60a77a6"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ab49c86b738822028b47a8fd14"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b97323410523f74139fbd6a84e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_2ba8f6cfe0b7273b7b02c4eb32"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_96cb9079b02fd51caaf18a417a"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_701ba9039b36234c51b66a23b5"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_26daf5e433d6fb88ee32ce9363"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ac0f09364e3701d9ed35435288"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ea83c3b911906a3578de2340fd"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_1230ebe7ada6874d51ae7cc7e9"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8cba26b24bbea7cff67a6f6f75"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_eb42e8a25edaa6a06096d6df05"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_5272ac3aa931eedb14cd8789d6"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_d16a885aa88447ccfd010e739b"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_abc255cfe0b1f3068a61b6c4a5"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3f92bb44026cedfe235c8b9124"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_484acb2ff8f3e134dfac8f01e8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_134735cc45672b90b366c20dc3"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_5f85e22b78c1d8681ceca05e69"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_f547886ce56d6470806b4606f5"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_aeb0f3a59ed2fd95e1a13097ed"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_2520d97de0c9a0fbfc9b00f4c1"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b9450a13a4299d264c9e53fb80"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_d53f91f073c6732c75b8204369"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6c039ced2230e9c06f2a872000"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_9e37be5051b435614120c03fea"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3c324ca49dabde7ffc0ef64675"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_cd5e019c76a79a59e9188d2aae"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_59b7a79203c34cf04826d76b8b"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_30bb2773875fbf546ec501e80a"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bcd8e1a275860e70f3a876d718"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_114cc380ce4148ae166ab38b30"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ee2f108dd2b132b4b225f6cf0e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_101cb71b62ea2d4e9cc56ab54d"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6385a745d9e12a89b859bb2562"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_a1eb449d8def14d83cf82066f9"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_1846199852a695713b1f8f5e9a"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_995d8194c43edfc98838cabc5a"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_22ad5445514d484d9a67095b59"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6fab7980dee7f667919aa5e635"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_2018133f9c98a1f0783df9dec8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6343513e20e2deab45edfce131"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_553196ea54b383f352401962af"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_63db05d5bb2f8dd831ed655021"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_33bb5b1b1a3a7e8b9787cd8778"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b15428f362be2200922952dc26"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3c65399d58c2822d294f2d2d2b"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b3aba33228acd59f2d734c31b8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_66181e465a65c2ddcfa9c00c9c"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_04881b33675e7ddf92129b64b8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_f1256cfc368e9645fd5800cf28"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_d22fbd5ac43b8fdc54f60cfdb9"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_69e7c84542b637b399d0a88f9c"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ec69ef8e48f54e2b8899131c86"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3816a9b513ab119616229d3356"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e9cb84fd8d4bca16c52818155b"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b66f30bdb828384bad81071007"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_109638590074998bb72a2f2cf0"`)
    await queryRunner.query(
      `ALTER TABLE "subscribers" ADD CONSTRAINT "UQ_1a7163c08f0e57bd1c9821508b1" UNIQUE ("email")`,
    )
    await queryRunner.query(`ALTER TABLE "subscribers" DROP COLUMN "tenant_id"`)
  }
}
