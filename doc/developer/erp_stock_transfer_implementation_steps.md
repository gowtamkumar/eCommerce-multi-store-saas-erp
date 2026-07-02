# Step-by-Step Implementation Guide: Document-Based Stock Transfers

This guide outlines the exact step-by-step engineering blueprint required to build a state-tracked, document-based Stock Transfer system between warehouses within a multi-store ERP platform.

---

## Step 1: Database Migration & Schema Design
To prevent direct, un-audited database writes, we represent stock transfers as formal documents composed of a parent record and a set of nested child line items.

1. **Create the Parent Table (`stock_transfers`):**
   * Fields: `id` (UUID, Primary Key), `store_id` (UUID, Indexed), `transfer_number` (String, Unique per store), `source_warehouse_id` (UUID), `destination_warehouse_id` (UUID), `status` (Enum: `DRAFT`, `APPROVED`, `IN_TRANSIT`, `RECEIVED`, `CANCELLED`), `remarks` (Text), `user_id` (UUID), `created_at`, `updated_at`.
2. **Create the Line Items Table (`stock_transfer_items`):**
   * Fields: `id` (UUID, Primary Key), `transfer_id` (UUID, Foreign Key referencing parent table with `ON DELETE CASCADE`), `product_id` (UUID), `variant_id` (UUID, Nullable), `quantity_requested` (Numeric), `quantity_received` (Numeric).
3. **Establish Database Indexes:**
   * Create index on `[store_id, status]` for query scoping.
   * Create index on `[store_id, transfer_number]` for rapid search.

---

## Step 2: Backend Entity Definitions
Define your database tables as TypeORM or Prisma models.

1. **Parent Entity (`StockTransferDocEntity`):**
   * Use `@Entity('stock_transfers')`.
   * Add `@ManyToOne` relationships for `sourceWarehouse`, `destinationWarehouse`, and `user`.
   * Add `@OneToMany` relationship referencing `StockTransferItemEntity` with `cascade: true`.
2. **Line Item Entity (`StockTransferItemEntity`):**
   * Use `@Entity('stock_transfer_items')`.
   * Bind relationship to product catalog entities (`ProductEntity`, `ProductVariantEntity`).

---

## Step 3: DTOs & Validation Schemas
Define Data Transfer Objects (DTOs) to validate user input at API request boundaries.

1. **Create DTO (`CreateStockTransferDocDto`):**
   * Validate source and destination warehouses (ensure they are not equal).
   * Validate array of line items containing `productId`, optional `variantId`, and `quantityRequested` (must be $> 0$).
2. **Update DTO (`UpdateStockTransferDocDto`):**
   * Allow editing only if status is `DRAFT`.
3. **Receive DTO (`ReceiveStockTransferDto`):**
   * Accept an array of line items with the fields `itemId` and `quantityReceived` to support registering partial receipt/damages.

---

## Step 4: Core Service Business Logic (State Machine)
Implement state-transition methods inside a NestJS service wrapped in atomic TypeORM transactions.

```typescript
// Example method shell showing structural transaction pattern
async ship(id: string, ctx: RequestContextDto) {
  return this.connection.transaction(async (manager) => {
    // 1. Lock the row to prevent race conditions
    const doc = await manager.findOne(StockTransferDocEntity, { where: { id, storeId: ctx.storeId }, relations: ['items'] });
    
    // 2. Enforce state sequence validation
    if (doc.status !== 'APPROVED') throw new BadRequestException('Can only ship approved transfers');
    
    // 3. Loop items and verify live stock at source warehouse
    for (const item of doc.items) {
      const stock = await this.inventoryService.getWarehouseStock(doc.sourceWarehouseId, item.productId, item.variantId, manager);
      if (stock < item.quantityRequested) {
        throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
      }
      
      // 4. Create Ledger Entries (Debit/Credit) via InventoryLedger
      await this.ledgerService.createEntry({
        type: InventoryTransactionType.TRANSFER_OUT,
        warehouseId: doc.sourceWarehouseId,
        quantity: -item.quantityRequested,
        productId: item.productId,
        variantId: item.variantId,
      }, manager);
    }
    
    // 5. Update parent status to IN_TRANSIT
    doc.status = 'IN_TRANSIT';
    await manager.save(doc);
  });
}
```

### State Triggers & Ledger Actions:
* **Draft $\rightarrow$ Approved:** Simple status change; no stock adjustments.
* **Approved $\rightarrow$ In-Transit:** Validate source inventory $\rightarrow$ Write negative `TRANSFER_OUT` ledger entries $\rightarrow$ Decrement cached warehouse stock.
* **In-Transit $\rightarrow$ Received:** Write positive `TRANSFER_IN` ledger entries (for the *actual* received quantity) $\rightarrow$ Increment cached destination warehouse stock.
* **In-Transit $\rightarrow$ Cancelled:** Rollback: Write positive `TRANSFER_IN` ledger entries back to the source warehouse.

---

## Step 5: API Controller Endpoints
Expose the service methods via a secure controller with authentication and permissions:

* `POST /stock-transfers` (Create Draft)
* `PUT /stock-transfers/:id` (Edit Draft)
* `POST /stock-transfers/:id/approve` (Approve Draft)
* `POST /stock-transfers/:id/ship` (Ship/Dispatch - deducts source stock)
* `POST /stock-transfers/:id/receive` (Receive - credits destination stock)
* `POST /stock-transfers/:id/cancel` (Cancel / Rollback)

---

## Step 6: Frontend User Interface
Design a dashboard containing:

1. **Registry Table:** Show listings with color-coded status pills (e.g., Orange for `IN_TRANSIT`, Green for `RECEIVED`).
2. **Transfer Creation Form:**
   * Select source & destination warehouses.
   * Add items via search dropdown with real-time displays of the current source stock limits.
3. **Side Drawer / Details Page:** Display timeline, transit routes, and dynamic action buttons based on document state.
4. **Receipt Modal:** Allow users to type in actual received quantities (reporting transit leakage or damage) before saving.

---

## Step 7: Automated E2E Tests
Write end-to-end testing scripts to verify the functionality of validation rules:
1. **Pass Test:** Verify standard `DRAFT` $\rightarrow$ `APPROVED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `RECEIVED` workflow results in correct final stock numbers.
2. **Validation Test:** Attempt to dispatch a transfer exceeding the available source inventory; check that it returns a 400 Bad Request error.
3. **Rollback Test:** Ship a transfer, cancel it, and verify that inventory is returned to the source warehouse.
