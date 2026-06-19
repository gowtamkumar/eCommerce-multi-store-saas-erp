import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddProductEmbeddings1781380000000 implements MigrationInterface {
  name = 'AddProductEmbeddings1781380000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_embeddings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "content_hash" character varying(64) NOT NULL,
        "embedding_model" character varying(128) NOT NULL,
        "embedding" jsonb NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_embeddings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_embeddings_tenant_product" UNIQUE ("tenant_id", "product_id"),
        CONSTRAINT "FK_product_embeddings_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_embeddings_tenant" ON "product_embeddings" ("tenant_id")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_embeddings"`)
  }
}
