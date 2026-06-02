import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AppModule } from './../src/app.module'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { StockTransferEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-transfer.entity'
import { StockTransferItemEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-transfer-item.entity'
import { StockTransferService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-transfer.service'
import { StockTransferStatus } from '@/common/enums/stock-transfer-status.enum'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'

describe('Stock Transfer Document Flow (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let stockTransferService: StockTransferService
  let inventoryLedgerService: InventoryLedgerService
  let accountingService: AccountingService
  let tenant: TenantEntity
  let ctx: RequestContextDto
  let product: ProductEntity
  let sourceWarehouse: WarehouseEntity
  let destinationWarehouse: WarehouseEntity

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
    stockTransferService = app.get(StockTransferService)
    inventoryLedgerService = app.get(InventoryLedgerService)
    accountingService = app.get(AccountingService)

    // 1. Create mock tenant
    const tenantRepo = dataSource.getRepository(TenantEntity)
    tenant = tenantRepo.create({
      storeName: 'E2E Stock Transfer Store',
      subdomain: `e2e-stock-transfer-${Date.now()}`,
    })
    await tenantRepo.save(tenant)

    ctx = new RequestContextDto()
    ctx.tenantId = tenant.id
    ctx.userId = '00000000-0000-0000-0000-000000000000'

    // 2. Initialize COA for accounting integrations
    await accountingService.initializeTenantCOA(ctx)

    // 3. Create a mock user
    const userRepo = dataSource.getRepository(UserEntity)
    const user = userRepo.create({
      id: '00000000-0000-0000-0000-000000000000',
      name: 'E2E Logistics Manager',
      username: `logisticsmgr-${Date.now()}`,
      password: 'password',
      tenantId: tenant.id,
    })
    await userRepo.save(user)

    // 4. Create mock product
    const productRepo = dataSource.getRepository(ProductEntity)
    product = productRepo.create({
      name: 'E2E Logistics Product',
      slug: `e2e-logistics-${Date.now()}`,
      description: 'Test product for stock transfers',
      price: 50.0,
      images: [],
      status: ProductStatus.ACTIVE,
      taxRate: 0,
      tenantId: tenant.id,
    })
    await productRepo.save(product)

    // 5. Create source and destination warehouses
    const warehouseRepo = dataSource.getRepository(WarehouseEntity)
    sourceWarehouse = warehouseRepo.create({
      name: 'E2E Source Warehouse',
      code: `SRC-${Date.now()}`,
      tenantId: tenant.id,
    })
    destinationWarehouse = warehouseRepo.create({
      name: 'E2E Destination Warehouse',
      code: `DST-${Date.now()}`,
      tenantId: tenant.id,
    })
    await warehouseRepo.save([sourceWarehouse, destinationWarehouse])
  })

  afterAll(async () => {
    if (tenant) {
      const tables = [
        'stock_transfer_items',
        'stock_transfers',
        'inventory_ledger',
        'products',
        'warehouses',
        'users',
        'ledger_entries',
        'journal_entries',
        'accounts',
      ]
      for (const table of tables) {
        try {
          await dataSource.query(`DELETE FROM "${table}" WHERE "tenant_id" = $1`, [tenant.id])
        } catch (e) {
          // Ignore tables that might fail
        }
      }
      const tenantRepo = dataSource.getRepository(TenantEntity)
      await tenantRepo.delete(tenant.id)
    }
    if (app) {
      await app.close()
    }
  })

  it('should execute a complete successful stock transfer lifecycle', async () => {
    const qtyRequested = 10

    // Seed stock in source warehouse (e.g., 25 units)
    await inventoryLedgerService.createLedgerEntry(
      {
        productId: product.id,
        warehouseId: sourceWarehouse.id,
        type: InventoryTransactionType.INITIAL_BALANCE,
        quantity: 25,
        referenceType: InventoryTransactionReferenceType.CYCLE_COUNT,
        referenceId: 'SEED-INITIAL-STOCK',
        remarks: 'Seed stock for E2E transfer tests',
      },
      ctx,
    )

    // Verify initial stock levels
    let srcStock = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      sourceWarehouse.id,
    )
    let dstStock = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      destinationWarehouse.id,
    )
    expect(srcStock).toBe(25)
    expect(dstStock).toBe(0)

    // 1. Create a DRAFT transfer document
    const transfer = await stockTransferService.create(
      {
        sourceWarehouseId: sourceWarehouse.id,
        destinationWarehouseId: destinationWarehouse.id,
        remarks: 'Transfer test remark',
        items: [
          {
            productId: product.id,
            quantityRequested: qtyRequested,
          },
        ],
      },
      ctx,
    )

    expect(transfer.status).toBe(StockTransferStatus.DRAFT)
    expect(transfer.transferNumber).toMatch(/^ST-\d{8}-\d{4}$/)
    expect(transfer.items).toHaveLength(1)
    expect(Number(transfer.items[0].quantityRequested)).toBe(qtyRequested)
    expect(Number(transfer.items[0].quantityReceived)).toBe(0)

    // Check stock hasn't moved yet
    srcStock = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      sourceWarehouse.id,
    )
    expect(srcStock).toBe(25)

    // 2. Approve the transfer document
    const approvedTransfer = await stockTransferService.approve(transfer.id, ctx)
    expect(approvedTransfer.status).toBe(StockTransferStatus.APPROVED)

    // Check stock hasn't moved yet
    srcStock = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      sourceWarehouse.id,
    )
    expect(srcStock).toBe(25)

    // 3. Ship the transfer document
    const shippedTransfer = await stockTransferService.ship(transfer.id, ctx)
    expect(shippedTransfer.status).toBe(StockTransferStatus.IN_TRANSIT)

    // Verify stock is deducted from source warehouse but not yet added to destination warehouse
    srcStock = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      sourceWarehouse.id,
    )
    dstStock = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      destinationWarehouse.id,
    )
    expect(srcStock).toBe(15) // 25 - 10
    expect(dstStock).toBe(0)

    // 4. Record Receipt
    const receivedTransfer = await stockTransferService.receive(
      transfer.id,
      {
        items: [
          {
            itemId: shippedTransfer.items[0].id,
            quantityReceived: 8, // Received slightly less than requested (e.g. 2 damaged)
          },
        ],
      },
      ctx,
    )

    expect(receivedTransfer.status).toBe(StockTransferStatus.RECEIVED)
    expect(Number(receivedTransfer.items[0].quantityReceived)).toBe(8)

    // Verify destination warehouse stock has incremented by actual received quantity
    srcStock = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      sourceWarehouse.id,
    )
    dstStock = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      destinationWarehouse.id,
    )
    expect(srcStock).toBe(15) // Stays at 15
    expect(dstStock).toBe(8) // Increments by 8
  })

  it('should revert stock deductions when a transfer in transit is cancelled', async () => {
    const qtyRequested = 5

    // Current source stock is 15 (from previous test)
    let srcStockBefore = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      sourceWarehouse.id,
    )
    expect(srcStockBefore).toBe(15)

    // 1. Create draft transfer
    const transfer = await stockTransferService.create(
      {
        sourceWarehouseId: sourceWarehouse.id,
        destinationWarehouseId: destinationWarehouse.id,
        remarks: 'Cancel test remark',
        items: [
          {
            productId: product.id,
            quantityRequested: qtyRequested,
          },
        ],
      },
      ctx,
    )

    // 2. Ship to move to IN_TRANSIT (stock will be deducted)
    await stockTransferService.ship(transfer.id, ctx)
    let srcStockInTransit = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      sourceWarehouse.id,
    )
    expect(srcStockInTransit).toBe(10) // 15 - 5

    // 3. Cancel the transfer in transit
    const cancelledTransfer = await stockTransferService.cancel(transfer.id, ctx)
    expect(cancelledTransfer.status).toBe(StockTransferStatus.CANCELLED)

    // 4. Verify stock is restored back to the source warehouse
    let srcStockAfter = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      sourceWarehouse.id,
    )
    let dstStockAfter = await inventoryLedgerService.getLiveStock(
      product.id,
      null,
      tenant.id,
      destinationWarehouse.id,
    )
    expect(srcStockAfter).toBe(15) // Restored back to 15!
    expect(dstStockAfter).toBe(8) // Stays at 8 (from previous test)
  })

  it('should throw an error when shipping a transfer with insufficient stock at the source warehouse', async () => {
    // 1. Create a transfer requesting more than is available (source has 15, we request 20)
    const transfer = await stockTransferService.create(
      {
        sourceWarehouseId: sourceWarehouse.id,
        destinationWarehouseId: destinationWarehouse.id,
        remarks: 'Over-request test',
        items: [
          {
            productId: product.id,
            quantityRequested: 20,
          },
        ],
      },
      ctx,
    )

    // 2. Shipping should fail due to insufficient stock
    await expect(stockTransferService.ship(transfer.id, ctx)).rejects.toThrow(/Insufficient stock/)
  })
})
