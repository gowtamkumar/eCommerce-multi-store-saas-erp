import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Marketing hardening migration:
 *
 *   1. Campaign log idempotency:
 *      - `recipient_key`, `opened_at`, `clicked_at` columns on campaign_logs
 *      - partial unique (campaign_id, recipient_key) where recipient_key IS NOT NULL
 *
 *   2. Loyalty earn idempotency + expiry:
 *      - `expires_at`, `remaining_points` columns on loyalty_ledger
 *      - partial unique (tenant, customer, type, reference_type, reference_id)
 *        where reference_id IS NOT NULL  (closes the double-award race)
 *      - composite (tenant_id, expires_at) index for the expiry sweep
 *      - `points_expire_after_days` column on loyalty_configs
 *
 *   3. Referral attribution audit:
 *      - `referred_at`, `referral_source` on users
 *
 *   4. Promotion slug uniqueness:
 *      - drop legacy GLOBAL unique on promotions.slug
 *      - add composite unique (tenant_id, slug)
 *
 *   5. Subscriber lifecycle:
 *      - `status`, tokens, audit, GDPR columns on subscribers
 *      - lowercase existing emails + scoped indexes
 *
 * Designed to be idempotent: every column/index is gated behind an
 * IF NOT EXISTS check so re-running the migration after a partial
 * synchronize:true pass is safe.
 */
export class MarketingMarketingHardening1780600000000 implements MigrationInterface {
  name = 'MarketingMarketingHardening1780600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── 1. Campaign log idempotency ───────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "campaign_logs"
       ADD COLUMN IF NOT EXISTS "recipient_key" varchar(255),
       ADD COLUMN IF NOT EXISTS "opened_at" timestamp,
       ADD COLUMN IF NOT EXISTS "clicked_at" timestamp`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_campaign_logs_campaign_recipient"
       ON "campaign_logs" ("campaign_id", "recipient_key")
       WHERE recipient_key IS NOT NULL`,
    )

    // ─── 2. Loyalty earn idempotency + expiry ──────────────────────────
    await queryRunner.query(
      `ALTER TABLE "loyalty_ledger"
       ADD COLUMN IF NOT EXISTS "expires_at" timestamp,
       ADD COLUMN IF NOT EXISTS "remaining_points" integer NOT NULL DEFAULT 0`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_loyalty_ledger_tenant_expires_at"
       ON "loyalty_ledger" ("tenant_id", "expires_at")`,
    )
    // Idempotency guard: one earn per (tenant, customer, type, ref) — but
    // only when reference_id is present (manual entries, redemptions are
    // not subject to dedup).
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_loyalty_ledger_event_dedup"
       ON "loyalty_ledger" ("tenant_id", "customer_id", "type", "reference_type", "reference_id")
       WHERE reference_id IS NOT NULL
         AND type IN ('EARNED', 'REFERRAL_BONUS', 'EXPIRED')`,
    )
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs"
       ADD COLUMN IF NOT EXISTS "points_expire_after_days" integer`,
    )

    // Backfill remaining_points so existing positive entries are eligible
    // for FIFO redemption / expiry sweep going forward.
    await queryRunner.query(
      `UPDATE "loyalty_ledger"
         SET "remaining_points" = "points"
       WHERE "points" > 0 AND "remaining_points" = 0
         AND "type" IN ('EARNED', 'REFERRAL_BONUS', 'MANUAL_CREDIT')`,
    )

    // ─── 3. Referral attribution audit ─────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "users"
       ADD COLUMN IF NOT EXISTS "referred_at" timestamp,
       ADD COLUMN IF NOT EXISTS "referral_source" varchar(100)`,
    )

    // ─── 4. Promotion slug uniqueness ──────────────────────────────────
    // Drop any legacy global unique on promotions.slug
    const promoConstraints: { conname: string }[] = await queryRunner.query(
      `SELECT conname FROM pg_constraint
        WHERE conrelid = 'promotions'::regclass
          AND contype = 'u'`,
    )
    for (const c of promoConstraints) {
      if (/slug/i.test(c.conname) && !/tenant/i.test(c.conname)) {
        await queryRunner.query(`ALTER TABLE "promotions" DROP CONSTRAINT IF EXISTS "${c.conname}"`)
      }
    }
    // Drop any non-composite unique index too.
    const promoIndexes: { indexname: string; indexdef: string }[] = await queryRunner.query(
      `SELECT indexname, indexdef FROM pg_indexes
        WHERE tablename = 'promotions'`,
    )
    for (const idx of promoIndexes) {
      if (
        /unique/i.test(idx.indexdef) &&
        /\(slug\)/i.test(idx.indexdef) &&
        !/tenant_id/i.test(idx.indexdef)
      ) {
        await queryRunner.query(`DROP INDEX IF EXISTS "${idx.indexname}"`)
      }
    }
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_promotions_tenant_slug"
       ON "promotions" ("tenant_id", "slug")`,
    )

    // ─── 5. Subscriber lifecycle ───────────────────────────────────────
    // Build enum type if not present.
    const enumExists = await queryRunner.query(
      `SELECT 1 FROM pg_type WHERE typname = 'subscribers_status_enum'`,
    )
    if (!enumExists.length) {
      await queryRunner.query(
        `CREATE TYPE "subscribers_status_enum" AS ENUM ('pending', 'confirmed', 'unsubscribed', 'suppressed')`,
      )
    }
    await queryRunner.query(
      `ALTER TABLE "subscribers"
       ADD COLUMN IF NOT EXISTS "status" "subscribers_status_enum" NOT NULL DEFAULT 'pending',
       ADD COLUMN IF NOT EXISTS "confirmation_token" varchar(64),
       ADD COLUMN IF NOT EXISTS "unsubscribe_token" varchar(64),
       ADD COLUMN IF NOT EXISTS "confirmed_at" timestamp,
       ADD COLUMN IF NOT EXISTS "unsubscribed_at" timestamp,
       ADD COLUMN IF NOT EXISTS "source" varchar(120),
       ADD COLUMN IF NOT EXISTS "consent_ip" varchar(45),
       ADD COLUMN IF NOT EXISTS "consent_user_agent" varchar(255)`,
    )
    // Backfill — anything already marked active is presumed confirmed.
    await queryRunner.query(
      `UPDATE "subscribers"
         SET "status" = 'confirmed',
             "confirmed_at" = COALESCE("confirmed_at", "created_at")
       WHERE "is_active" = true AND "status" = 'pending'`,
    )
    // Lowercase existing emails for the case-insensitive unique guarantee.
    await queryRunner.query(
      `UPDATE "subscribers" SET "email" = LOWER("email") WHERE "email" <> LOWER("email")`,
    )
    // Ensure unsubscribe tokens exist on already-active rows so the
    // unsubscribe link can be generated for legacy subscribers without
    // a re-confirmation step.
    await queryRunner.query(
      `UPDATE "subscribers"
         SET "unsubscribe_token" = MD5(RANDOM()::text || id::text)
       WHERE "unsubscribe_token" IS NULL AND "status" = 'confirmed'`,
    )

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscribers_tenant_status"
       ON "subscribers" ("tenant_id", "status")`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscribers_confirmation_token"
       ON "subscribers" ("confirmation_token")`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_subscribers_unsubscribe_token"
       ON "subscribers" ("unsubscribe_token")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Subscribers
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscribers_unsubscribe_token"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscribers_confirmation_token"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscribers_tenant_status"`)
    await queryRunner.query(
      `ALTER TABLE "subscribers"
       DROP COLUMN IF EXISTS "consent_user_agent",
       DROP COLUMN IF EXISTS "consent_ip",
       DROP COLUMN IF EXISTS "source",
       DROP COLUMN IF EXISTS "unsubscribed_at",
       DROP COLUMN IF EXISTS "confirmed_at",
       DROP COLUMN IF EXISTS "unsubscribe_token",
       DROP COLUMN IF EXISTS "confirmation_token",
       DROP COLUMN IF EXISTS "status"`,
    )
    await queryRunner.query(`DROP TYPE IF EXISTS "subscribers_status_enum"`)

    // Promotions
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_promotions_tenant_slug"`)

    // Users
    await queryRunner.query(
      `ALTER TABLE "users"
       DROP COLUMN IF EXISTS "referral_source",
       DROP COLUMN IF EXISTS "referred_at"`,
    )

    // Loyalty
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_loyalty_ledger_event_dedup"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_loyalty_ledger_tenant_expires_at"`)
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs"
       DROP COLUMN IF EXISTS "points_expire_after_days"`,
    )
    await queryRunner.query(
      `ALTER TABLE "loyalty_ledger"
       DROP COLUMN IF EXISTS "remaining_points",
       DROP COLUMN IF EXISTS "expires_at"`,
    )

    // Campaign logs
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_campaign_logs_campaign_recipient"`)
    await queryRunner.query(
      `ALTER TABLE "campaign_logs"
       DROP COLUMN IF EXISTS "clicked_at",
       DROP COLUMN IF EXISTS "opened_at",
       DROP COLUMN IF EXISTS "recipient_key"`,
    )
  }
}
