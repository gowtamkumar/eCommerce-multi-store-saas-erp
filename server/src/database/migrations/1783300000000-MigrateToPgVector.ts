import { MigrationInterface, QueryRunner } from 'typeorm'

export class MigrateToPgVector1783300000000 implements MigrationInterface {
  name = 'MigrateToPgVector1783300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enable the pgvector extension in the database
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector')

    // 2. Drop the old jsonb column from product_embeddings
    await queryRunner.query('ALTER TABLE "product_embeddings" DROP COLUMN IF EXISTS "embedding"')

    // 3. Add the new vector column with a fixed dimension of 1536
    await queryRunner.query('ALTER TABLE "product_embeddings" ADD COLUMN "embedding" vector(1536)')

    // 4. Create an HNSW index to speed up vector cosine similarity queries
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_product_embeddings_vector" ON "product_embeddings" USING hnsw (embedding vector_cosine_ops)'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_product_embeddings_vector"')
    await queryRunner.query('ALTER TABLE "product_embeddings" DROP COLUMN IF EXISTS "embedding"')
    await queryRunner.query('ALTER TABLE "product_embeddings" ADD COLUMN "embedding" jsonb NOT NULL')
  }
}
