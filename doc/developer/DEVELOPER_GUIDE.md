# Enterprise Multi-Store SaaS ERP — Core Developer Guide

**Document Version:** 1.0.0  
**Prepared By:** Senior Systems Architect & Principal Engineer  
**Status:** Released for Engineering Teams  

---

## 1. System Architecture & Context Propagation

This SaaS ERP is built as a **Modular Monolith** using **NestJS**. While all domains share a single database and runtime, they are strictly separated into isolated modules under `server/src/modules/admin/`. Communication between these modules is asynchronous and event-driven, leveraging **NestJS EventEmitter** for immediate transactional side-effects and **BullMQ** for delayed or high-overhead background processes.

```
                  ┌────────────────────────────────────────┐
                  │          Express Middleware            │
                  │   (Extract Hostname & JWT Token)       │
                  └───────────────────┬────────────────────┘
                                      ▼
                  ┌────────────────────────────────────────┐
                  │    RequestContext & Scoping Guards     │
                  │ (Inject storeId, branchId, userId)   │
                  └───────────────────┬────────────────────┘
                                      ▼
                  ┌────────────────────────────────────────┐
                  │             NestJS Service             │
                  │   (Business Logics & Transaction)      │
                  └─────────┬────────────────────┬─────────┘
                            │                    │
                            ▼                    ▼
                  ┌──────────────────┐  ┌──────────────────┐
                  │ TypeORM Database │  │ BullMQ Queue /   │
                  │  (Scoped SQL)    │  │ EventEmitter     │
                  └──────────────────┘  └──────────────────┘
```

### 1.1 Context Scoping Lifecycle
Every incoming HTTP request goes through a strict verification lifecycle before reaching any service:
1.  **Store Resolution Middleware:** Inspects the `Host` header (resolving `subdomain.yourplatform.com` or `customdomain.com` mapped in database) and injects `request.storeId` into the Express request context.
2.  **JWT Authentication Guard:** Extracts the JSON Web Token, loads the authenticated user, and binds `request.user` and `request.userId`.
3.  **Scope Verification Guards:** 
    *   `SubscriptionGuard`: Verifies that the store has the logical plan key (e.g., `staff_accounts`, `advanced_analytics`) for the accessed path.
    *   `BranchScopeGuard` / `WarehouseScopeGuard`: Limits staff requests to data within their permitted organizational boundaries.

---

## 2. Step-by-Step: Adding a New ERP Module

To maintain the architectural integrity of the Modular Monolith, every new feature (e.g., a *Fixed Asset* or *Manufacturing* module) must be implemented using this rigid 5-step pipeline.

### Step 2.1: Define the DB Entity
All store-bound entities must explicitly define `storeId`, map the relationship to `StoreEntity`, and include indexes to optimize multi-store lookups.

Create the file `server/src/modules/admin/operations/finance/asset/entities/fixed-asset.entity.ts`:
```typescript
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

@Entity('fixed_assets')
@Index(['storeId'])
@Index(['storeId', 'code'], { unique: true })
export class FixedAssetEntity extends BaseEntity {
  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ unique: true })
  code: string

  @Column()
  name: string

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  cost: number

  @Column({ name: 'salvage_value', type: 'decimal', precision: 15, scale: 2, default: 0 })
  salvageValue: number

  @Column({ name: 'useful_life_years', type: 'int' })
  usefulLifeYears: number

  @Column({ name: 'accumulated_depreciation', type: 'decimal', precision: 15, scale: 2, default: 0 })
  accumulatedDepreciation: number
}
```

### Step 2.2: Implement the Scoped Data Repository
Never run database queries without scoping by `storeId`. Create a transaction-safe service repository pattern:

```typescript
import { Injectable, Scope } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FixedAssetEntity } from './entities/fixed-asset.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable({ scope: Scope.REQUEST })
export class FixedAssetRepository {
  constructor(
    @InjectRepository(FixedAssetEntity)
    private readonly repo: Repository<FixedAssetEntity>,
  ) {}

  async findAll(ctx: RequestContextDto): Promise<FixedAssetEntity[]> {
    return this.repo.find({
      where: { storeId: ctx.storeId },
    })
  }

  async findByCode(ctx: RequestContextDto, code: string): Promise<FixedAssetEntity | null> {
    return this.repo.findOne({
      where: { storeId: ctx.storeId, code },
    })
  }

  async create(ctx: RequestContextDto, entityData: Partial<FixedAssetEntity>): Promise<FixedAssetEntity> {
    const asset = this.repo.create({
      ...entityData,
      storeId: ctx.storeId,
    })
    return this.repo.save(asset)
  }
}
```

### Step 2.3: Build the Service Layer with Transaction Boundary
Implement business logic and wrap multiple operations in a database transaction runner.

```typescript
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FixedAssetRepository } from './fixed-asset.repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { FixedAssetEntity } from './entities/fixed-asset.entity'

@Injectable()
export class FixedAssetService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly assetRepo: FixedAssetRepository,
  ) {}

  async purchaseAsset(ctx: RequestContextDto, data: Partial<FixedAssetEntity>): Promise<FixedAssetEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Save Asset
      const savedAsset = await this.assetRepo.create(ctx, data)

      // 2. Emit Financial Journal Event (Decoupled accounting)
      // The accounting listener will automatically post balanced debits/credits on 'asset.purchased'
      ctx.eventEmitter.emit('asset.purchased', {
        ctx,
        assetId: savedAsset.id,
        cost: savedAsset.cost,
      })

      await queryRunner.commitTransaction()
      return savedAsset
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
```

### Step 2.4: Wire up the Controller and Guards
Apply the security middleware, permissions, and subscription gates to the API endpoints.

```typescript
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common'
import { FixedAssetService } from './fixed-asset.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '@/common/guards/permissions.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequirePermission } from '@/common/decorators/require-permission.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { GetContext } from '@/common/decorators/get-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Controller('admin/operations/finance/assets')
@UseGuards(JwtAuthGuard, SubscriptionGuard, PermissionsGuard)
@RequireFeature('fixed_assets') // Subscription plan feature gate
export class FixedAssetController {
  constructor(private readonly service: FixedAssetService) {}

  @Post()
  @RequirePermission('assets:create') // RBAC check
  async createAsset(
    @GetContext() ctx: RequestContextDto,
    @Body() body: any,
  ) {
    return this.service.purchaseAsset(ctx, body)
  }
}
```

### Step 2.5: Register the Module in dependencies
Inject entities and controllers into NestJS module metadata.

```typescript
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FixedAssetEntity } from './entities/fixed-asset.entity'
import { FixedAssetController } from './fixed-asset.controller'
import { FixedAssetService } from './fixed-asset.service'
import { FixedAssetRepository } from './fixed-asset.repository'

@Module({
  imports: [TypeOrmModule.forFeature([FixedAssetEntity])],
  controllers: [FixedAssetController],
  providers: [FixedAssetService, FixedAssetRepository],
  exports: [FixedAssetService],
})
export class FixedAssetModule {}
```

---

## 3. Multi-Store Database Security (The Boundary Guards)

Every database table representing customer metrics must use composite indexing to optimize store queries. **Direct un-scoped queries on product variants or user accounts will fail security static analysis.**

### 3.1 Composite Unique Index Rule
A common pitfall is creating simple unique indexes. If a store creates SKU `IPHONE-15`, that unique index will block *other* stores from adding their own `IPHONE-15`.
**Rule:** Every unique constraint must contain the `storeId` field and ignore soft-deleted rows.

```typescript
@Entity('product_variants')
@Index(['storeId', 'sku'], { unique: true, where: '"deleted_at" IS NULL' })
export class ProductVariantEntity extends BaseEntity { ... }
```

### 3.2 S3 File Bucket Isolation Pattern
Upload parameters must partition storage buckets dynamically by store context to prevent data leaks.

```typescript
export function getStoreUploadPath(storeId: string, filename: string): string {
  const fileHash = crypto.createHash('md5').update(filename + Date.now().toString()).digest('hex')
  // Format: t/{storeId}/{domain}/{hash_file}
  return `t/${storeId}/catalog/${fileHash}-${filename}`
}
```

---

## 4. Operational Invariant Safeguards

### 4.1 Stock Ledger Modification Flow (BullMQ Integration)
We never update product quantities directly. Direct calculations risk data overrides under race conditions.
Instead, we push stock change requests to the background FIFO queue using **BullMQ**.

```typescript
// 1. Push job to Queue
await this.productQueue.add(
  'update-stock',
  {
    storeId: ctx.storeId,
    variantId: orderItem.variantId,
    quantity: -orderItem.quantity, // Negative for Sales
    referenceType: 'ORDER',
    referenceId: order.id,
  },
  { jobId: `stock_sync:${order.id}:${orderItem.id}` } // Idempotent key preventing duplicate run
)

// 2. Queue processor executes ledger insertion
@Process('update-stock')
async handleStockSync(job: Job) {
  const { storeId, variantId, quantity, referenceType, referenceId } = job.data
  
  await this.dataSource.transaction(async (manager) => {
    // Insert row to inventory_transactions ledger
    const ledgerEntry = manager.create(InventoryTransactionEntity, {
      storeId,
      variantId,
      quantity,
      referenceType,
      referenceId,
    })
    await manager.save(ledgerEntry)
  })
}
```

### 4.2 Balanced Double-Entry Journals (Financial Invariant)
All financial events must result in balanced entries.
The general ledger uses transaction hooks where `debitSum === creditSum` is validated before committing.

```typescript
export function validateJournalBalance(entries: LedgerEntryEntity[]): boolean {
  let debitSum = 0
  let creditSum = 0

  for (const entry of entries) {
    if (entry.type === 'DEBIT') debitSum += Number(entry.amount)
    if (entry.type === 'CREDIT') creditSum += Number(entry.amount)
  }

  // Float point precision safe equality check
  return Math.abs(debitSum - creditSum) < 0.0001
}
```

---

## 5. Performance Tuning & Database Optimizations

1.  **Strict Eager-Loading Prevention (N+1 queries):** Do not configure relations with `{ eager: true }` in TypeORM entity definitions. This forces recursive queries. Use explicit TypeORM `.createQueryBuilder().leftJoinAndSelect()` to load nested relations on demand.
2.  **Redis Cache-Aside Scoping Pattern:**
    ```typescript
    // Cache Prefix: t:{storeId}:{module}:{customKey}
    const cacheKey = `t:${ctx.storeId}:reports:pl:${startDate}:${endDate}`
    
    const cachedData = await this.cacheManager.get(cacheKey)
    if (cachedData) return cachedData

    const data = await this.compileProfitLossReport(ctx, startDate, endDate)
    await this.cacheManager.set(cacheKey, data, 600) // Cache for 10 minutes
    return data
    ```
3.  **Soft-Deletes Scoping:** Every TypeORM find/query runner naturally appends `deletedAt IS NULL`. If writing raw SQL, always include:
    ```sql
    WHERE deleted_at IS NULL AND store_id = :storeId
    ```
