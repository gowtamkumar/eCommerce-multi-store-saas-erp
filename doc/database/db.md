# Database Schema Documentation

This document provides an overview of the entities and their relationships within the multi-tenant SaaS eCommerce platform.

## Base Entity
All entities extend `BaseEntity`, which includes:
- `id`: `uuid` (Primary Key)
- `created_at`: `timestamptz`
- `updated_at`: `timestamptz`

---

## Admin Module

### Catalog

#### Brand Entity
- **Table**: `brands`
- **Fields**:
    - `name`: `varchar(255)`
    - `slug`: `varchar(255)`
    - `description`: `text` (nullable)
    - `image`: `varchar(500)` (nullable)
    - `website`: `varchar(500)` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Category Entity
- **Table**: `categories`
- **Fields**:
    - `name`: `varchar(255)`
    - `slug`: `varchar(255)`
    - `description`: `text` (nullable)
    - `image`: `varchar(500)` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `OneToMany` -> `ProductEntity`
    - `ManyToOne` -> `UserEntity` (user_id)

#### Product Entity
- **Table**: `products`
- **Fields**:
    - `name`: `varchar(255)`
    - `slug`: `varchar(255)` (unique)
    - `description`: `text`
    - `short_description`: `text` (nullable)
    - `price`: `decimal(10,2)`
    - `is_review`: `boolean` (default: true)
    - `discount_amount`: `decimal(10,2)` (default: 0)
    - `discount_type`: `enum` (DiscountType: `percentage`, `fixed`) (nullable, default: `percentage`)
    - `tax_rate`: `decimal(5,2)` (nullable, default: 0) — percentage, e.g. 15 = 15%
    - `images`: `simple-array`
    - `stock`: `int` (default: 0)
    - `low_stock_threshold`: `int` (default: 5)
    - `status`: `enum` (ProductStatus)
    - `category_id`: `uuid` (nullable)
    - `brand_id`: `uuid` (nullable)
    - `landing_page_id`: `uuid` (nullable)
    - `faq_source`: `varchar(50)` (default: 'manual')
    - `faq_ids`: `simple-array` (nullable)
    - `supplier_id`: `uuid` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `CategoryEntity` (category_id)
    - `ManyToOne` -> `BrandEntity` (brand_id)
    - `OneToMany` -> `FaqEntity`
    - `OneToMany` -> `ProductAttributeEntity`
    - `OneToMany` -> `ProductVariantEntity`
    - `OneToMany` -> `ReviewEntity`
    - `ManyToOne` -> `SupplierEntity` (supplier_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Product Attribute Entity
- **Table**: `product_attributes`
- **Fields**:
    - `name`: `varchar(100)`
    - `values`: `simple-array`
    - `product_id`: `uuid`
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `ProductEntity` (product_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Product Variant Entity
- **Table**: `product_variants`
- **Fields**:
    - `sku`: `varchar(255)`
    - `price`: `decimal(10,2)` (nullable)
    - `stock`: `int` (default: 0)
    - `low_stock_threshold`: `int` (default: 5)
    - `images`: `simple-array` (nullable)
    - `combination`: `jsonb` (e.g., Color: Red)
    - `product_id`: `uuid`
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `ProductEntity` (product_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Review Entity
- **Table**: `reviews`
- **Fields**:
    - `product_id`: `uuid`
    - `customer_name`: `varchar(255)`
    - `customer_email`: `varchar(255)`
    - `rating`: `int` (default: 5)
    - `comment`: `text`
    - `status`: `enum` (ReviewStatus)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `ProductEntity` (product_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

### Content

#### FAQ Entity
- **Table**: `faqs`
- **Fields**:
    - `question`: `text`
    - `answer`: `text`
    - `category`: `varchar(100)` (default: 'General')
    - `order`: `int` (default: 0)
    - `status`: `enum` (FaqStatus)
    - `tenant_id`: `uuid`
    - `product_id`: `uuid` (nullable)
    - `page_id`: `uuid` (nullable)
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `ProductEntity` (product_id)
    - `ManyToOne` -> `PageEntity` (page_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Page Entity
- **Table**: `pages`
- **Fields**:
    - `title`: `varchar(255)`
    - `slug`: `varchar(255)`
    - `is_home_page`: `boolean` (default: false)
    - `order`: `int` (default: 0)
    - `sections`: `jsonb`
    - `meta_title`: `varchar(255)` (nullable)
    - `meta_description`: `text` (nullable)
    - `typography`: `jsonb`
    - `status`: `enum` (draft/published)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

### Core/User

#### Staff Invitation Entity
- **Table**: `staff_invitations`
- **Fields**:
    - `email`: `varchar`
    - `role`: `enum` (UserRole)
    - `tenant_id`: `uuid`
    - `token`: `varchar` (unique)
    - `status`: `enum` (InvitationStatus)
    - `expires_at`: `timestamptz`
    - `invited_by`: `uuid` (nullable)

#### User Entity
- **Table**: `users`
- **Fields**:
    - `name`: `varchar`
    - `email`: `varchar` (nullable)
    - `username`: `varchar`
    - `password`: `varchar`
    - `phone`: `varchar` (nullable)
    - `address`: `text` (nullable)
    - `image`: `varchar` (nullable)
    - `is_admin`: `boolean` (default: false)
    - `is_email_verified`: `boolean` (default: false)
    - `email_verification_token`: `varchar` (nullable)
    - `reset_password_token`: `varchar` (nullable)
    - `reset_password_expires`: `timestamptz` (nullable)
    - `role`: `enum` (UserRole)
    - `status`: `enum` (UserStatus)
    - `refresh_token`: `varchar` (nullable)
    - `tenant_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)

### Customer

#### Lead Entity
- **Table**: `leads`
- **Fields**:
    - `name`: `varchar(255)` (nullable)
    - `email`: `varchar(255)`
    - `phone`: `varchar(50)` (nullable)
    - `address`: `text` (nullable)
    - `subject`: `varchar(255)` (nullable)
    - `message`: `text` (nullable)
    - `status`: `enum` (LeadStatus)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Subscriber Entity
- **Table**: `subscribers`
- **Fields**:
    - `email`: `varchar` (unique)
    - `is_active`: `boolean` (default: true)
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `UserEntity` (user_id)

### Operations - Finance

#### Expense Entity
- **Table**: `expenses`
- **Fields**:
    - `title`: `varchar(255)`
    - `description`: `text` (nullable)
    - `amount`: `decimal(10,2)`
    - `expense_date`: `date`
    - `category`: `enum` (ExpenseCategory)
    - `reference_number`: `varchar(100)` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Invoice Entity
- **Table**: `invoices`
- **Fields**:
    - `invoice_number`: `varchar(100)` (unique)
    - `order_id`: `uuid`
    - `issue_date`: `date`
    - `due_date`: `date` (nullable)
    - `status`: `enum` (InvoiceStatus)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `OrderEntity` (order_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Purchase Order Entity
- **Table**: `purchase_orders`
- **Fields**:
    - `reference_number`: `varchar(255)`
    - `supplier_id`: `uuid`
    - `status`: `enum` (PurchaseOrderStatus)
    - `total_amount`: `decimal(10,2)`
    - `payment_status`: `enum` (PurchaseOrderPaymentStatus)
    - `paid_amount`: `decimal(10,2)`
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `SupplierEntity` (supplier_id)
    - `OneToMany` -> `PurchaseOrderItemEntity`
    - `OneToMany` -> `SupplierPaymentEntity`
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Purchase Order Item Entity
- **Table**: `purchase_order_items`
- **Fields**:
    - `purchase_order_id`: `uuid`
    - `product_id`: `uuid`
    - `variant_id`: `uuid` (nullable)
    - `quantity`: `int`
    - `unit_price`: `decimal(10,2)`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `PurchaseOrderEntity` (purchase_order_id)
    - `ManyToOne` -> `ProductEntity` (product_id)
    - `ManyToOne` -> `ProductVariantEntity` (variant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Supplier Payment Entity
- **Table**: `supplier_payments`
- **Fields**:
    - `purchase_order_id`: `uuid`
    - `supplier_id`: `uuid`
    - `amount`: `decimal(10,2)`
    - `payment_date`: `timestamp`
    - `payment_method`: `varchar(50)`
    - `transaction_id`: `varchar(255)` (nullable)
    - `note`: `text` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `PurchaseOrderEntity` (purchase_order_id)
    - `ManyToOne` -> `SupplierEntity` (supplier_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Supplier Entity
- **Table**: `suppliers`
- **Fields**:
    - `name`: `varchar(255)`
    - `contact_name`: `varchar(255)` (nullable)
    - `email`: `varchar(255)` (nullable)
    - `phone`: `varchar(50)` (nullable)
    - `address`: `text` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

### Operations - Infra

#### File Entity
- **Table**: `files`
- **Fields**:
    - `fieldname`: `varchar`
    - `originalname`: `varchar` (nullable)
    - `encoding`: `varchar` (nullable)
    - `mimetype`: `varchar` (nullable)
    - `destination`: `varchar` (nullable)
    - `filename`: `varchar` (nullable)
    - `pdf_file`: `varchar` (nullable)
    - `path`: `varchar` (nullable)
    - `size`: `number` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `UserEntity` (user_id)

### Operations - Logistics

#### Inventory Transaction Entity
- **Table**: `inventory_transactions`
- **Fields**:
    - `product_id`: `uuid`
    - `variant_id`: `uuid` (nullable)
    - `supplier_id`: `uuid` (nullable)
    - `type`: `enum` (InventoryTransactionType)
    - `quantity`: `int`
    - `reference_type`: `enum` (InventoryTransactionReferenceType)
    - `reference_id`: `varchar(255)` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `ProductEntity` (product_id)
    - `ManyToOne` -> `ProductVariantEntity` (variant_id)
    - `ManyToOne` -> `SupplierEntity` (supplier_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

### Sales

#### Coupon Entity
- **Table**: `coupons`
- **Fields**:
    - `code`: `varchar(50)`
    - `description`: `varchar(255)` (nullable)
    - `discountType`: `enum` (DiscountType)
    - `amount`: `decimal(10,2)`
    - `min_purchase_amount`: `decimal(10,2)` (default: 0)
    - `start_date`: `timestamp` (nullable)
    - `expiry_date`: `timestamp` (nullable)
    - `usage_limit`: `int` (nullable)
    - `used_count`: `int` (default: 0)
    - `is_active`: `boolean` (default: true)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Order Entity
- **Table**: `orders`
- **Fields**:
    - `customer_name`: `varchar(255)`
    - `customer_email`: `varchar(255)`
    - `customer_phone`: `varchar(50)`
    - `address`: `text`
    - `total_amount`: `decimal(10,2)`
    - `currency`: `varchar(10)` (default: 'BDT')
    - `currency_rate`: `decimal(10,4)` (default: 1)
    - `status`: `enum` (OrderStatus)
    - `payment_method`: `enum` (PaymentMethod)
    - `payment_status`: `enum` (PaymentStatus)
    - `transaction_id`: `varchar(255)` (nullable)
    - `order_notes`: `text` (nullable)
    - `user_id`: `uuid`
    - `tenant_id`: `uuid`
    - `tracking_id`: `varchar(255)` (nullable)
    - `courier_status`: `varchar(255)` (nullable)
    - `applied_coupon`: `varchar(50)` (nullable)
    - `coupon_discount_amount`: `decimal(10,2)` (default: 0)
- **Relationships**:
    - `OneToMany` -> `OrderItemEntity`
    - `OneToMany` -> `OrderReturnEntity`
    - `ManyToOne` -> `TenantEntity` (tenant_id)

#### Order Item Entity
- **Table**: `order_items`
- **Fields**:
    - `order_id`: `uuid`
    - `product_id`: `uuid`
    - `variant_id`: `uuid` (nullable)
    - `snapshot`: `jsonb` (nullable)
    - `quantity`: `int`
    - `unit_price`: `decimal(10,2)`
    - `discount_amount`: `decimal(10,2)` (default: 0)
    - `total_amount`: `decimal(10,2)`
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `OrderEntity` (order_id)
    - `ManyToOne` -> `ProductEntity` (product_id)
    - `ManyToOne` -> `ProductVariantEntity` (variant_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Order Return Entity
- **Table**: `order_returns`
- **Fields**:
    - `order_id`: `uuid`
    - `user_id`: `uuid`
    - `status`: `enum` (ReturnStatus)
    - `reason`: `text`
    - `admin_comment`: `text` (nullable)
    - `refund_amount`: `decimal(10,2)` (nullable)
    - `items`: `jsonb` (returned items list)
    - `tenant_id`: `uuid`
- **Relationships**:
    - `ManyToOne` -> `OrderEntity` (order_id)
    - `ManyToOne` -> `UserEntity` (user_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)

#### Payment Entity
- **Table**: `payments`
- **Fields**:
    - `order_id`: `uuid`
    - `user_id`: `uuid` (nullable)
    - `transaction_id`: `varchar(255)`
    - `amount`: `decimal(10,2)`
    - `currency`: `varchar(10)` (default: 'BDT')
    - `method`: `varchar(50)`
    - `status`: `varchar(50)`
    - `gateway_response`: `jsonb` (nullable)
    - `tenant_id`: `uuid`
- **Relationships**:
    - `ManyToOne` -> `OrderEntity` (order_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)

#### Promotion Entity
- **Table**: `promotions`
- **Fields**:
    - `name`: `varchar(255)`
    - `slug`: `varchar` (unique)
    - `description`: `text` (nullable)
    - `promotionType`: `enum` (PromotionType)
    - `value`: `decimal(10,2)` (nullable)
    - `targetType`: `enum` (PromotionTargetType)
    - `targetId`: `uuid` (nullable)
    - `min_order_value`: `decimal(10,2)` (nullable)
    - `start_date`: `timestamp` (nullable)
    - `end_date`: `timestamp` (nullable)
    - `is_active`: `boolean` (default: true)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

### Settings

#### Site Settings Entity
- **Table**: `site_settings`
- **Fields**:
    - `logo`: `varchar` (nullable)
    - `brand_name`: `varchar` (nullable)
    - `site_description`: `varchar` (nullable)
    - `contact_email`: `varchar` (nullable)
    - `contact_phone`: `varchar` (nullable)
    - `whatsapp_phone`: `varchar` (nullable)
    - `address`: `varchar` (nullable)
    - `currency`: `varchar` (nullable)
    - `currency_symbol`: `varchar` (nullable)
    - `supported_currencies`: `jsonb` (nullable)
    - `social_links`: `jsonb` (nullable)
    - `marketing`: `jsonb` (nullable)
    - `smtp`: `jsonb` (nullable)
    - `payment`: `jsonb` (nullable)
    - `pathao_courier`: `jsonb` (nullable)
    - `steadfast_courier`: `jsonb` (nullable)
    - `navbar`: `jsonb` (nullable)
    - `footer`: `jsonb` (nullable)
    - `trust_badges`: `jsonb` (nullable)
    - `products_page`: `jsonb` (nullable)
    - `single_product_page`: `jsonb` (nullable)
    - `offers_page`: `jsonb` (nullable)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

---

## Store Module

#### Cart Entity
- **Table**: `carts`
- **Fields**:
    - `user_id`: `uuid`
    - `tenant_id`: `uuid`
    - `applied_coupon_code`: `varchar(50)` (nullable)
- **Relationships**:
    - `ManyToOne` -> `UserEntity` (user_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `OneToMany` -> `CartItemEntity`

#### Cart Item Entity
- **Table**: `cart_items`
- **Fields**:
    - `cart_id`: `uuid`
    - `product_id`: `uuid`
    - `variant_id`: `uuid` (nullable)
    - `quantity`: `int` (default: 1)
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `CartEntity` (cart_id)
    - `ManyToOne` -> `ProductEntity` (product_id)
    - `ManyToOne` -> `ProductVariantEntity` (variant_id)
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `UserEntity` (user_id)

#### Shipping Address Entity
- **Table**: `shipping_addresses`
- **Fields**:
    - `user_id`: `uuid`
    - `tenant_id`: `uuid`
    - `label`: `varchar(100)` (nullable)
    - `recipient_name`: `varchar(255)`
    - `phone`: `varchar(20)`
    - `address`: `text`
    - `city`: `varchar(100)` (nullable)
    - `zone`: `enum` (ShippingZoneType) (nullable)
    - `is_default`: `boolean` (default: false)

---

## System Module

#### Audit Log Entity
- **Table**: `audit_logs`
- **Fields**:
    - `tenant_id`: `uuid`
    - `user_id`: `uuid` (nullable)
    - `action`: `varchar(100)` (e.g., CREATE, UPDATE)
    - `entity`: `varchar(100)` (e.g., Product)
    - `entity_id`: `varchar(255)` (nullable)
    - `old_value`: `jsonb` (nullable)
    - `new_value`: `jsonb` (nullable)
    - `ip_address`: `varchar(45)` (nullable)
    - `user_agent`: `text` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)

#### Platform Settings Entity
- **Table**: `platform_settings`
- **Fields**:
    - `brand_name`: `varchar` (nullable)
    - `brand_logo`: `varchar` (nullable)
    - `support_email`: `varchar` (nullable)
    - `hero`: `jsonb` (nullable)
    - `features`: `jsonb` (nullable)
    - `footer`: `jsonb` (nullable)
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `UserEntity` (user_id)

#### Subscription Plan Entity
- **Table**: `subscription_plans`
- **Fields**:
    - `name`: `varchar(255)`
    - `description`: `text` (nullable)
    - `price`: `decimal(10,2)` (default: 0)
    - `features`: `jsonb` (default: [])
    - `is_active`: `boolean` (default: true)
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `OneToMany` -> `TenantEntity`
    - `ManyToOne` -> `UserEntity` (user_id)

#### Subscription Invoice Entity
- **Table**: `subscription_invoices`
- **Fields**:
    - `invoice_number`: `varchar(100)` (unique)
    - `tenant_id`: `uuid`
    - `subscription_plan_id`: `uuid`
    - `amount`: `decimal(10,2)`
    - `currency`: `varchar(10)` (default: 'USD')
    - `status`: `enum` (PaymentStatus) (default: `pending`)
    - `transaction_id`: `varchar(255)` (nullable)
    - `billing_date`: `timestamptz` (default: now)
    - `payment_url`: `text` (nullable)
    - `gateway_response`: `jsonb` (nullable)
- **Relationships**:
    - `ManyToOne` -> `TenantEntity` (tenant_id)
    - `ManyToOne` -> `SubscriptionPlanEntity` (subscription_plan_id)

#### Tenant Traffic Entity
- **Table**: `tenant_traffic`
- **Fields**:
    - `tenant_id`: `uuid`
    - `date`: `date`
    - `request_count`: `int` (default: 0)
    - `last_updated`: `timestamptz` (default: now)
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `UserEntity` (user_id)

#### Tenant Entity
- **Table**: `tenants`
- **Fields**:
    - `store_name`: `varchar`
    - `subdomain`: `varchar` (unique)
    - `custom_domain`: `varchar` (nullable, unique)
    - `custom_domain_status`: `enum` (CustomDomainStatus)
    - `custom_domain_verified_at`: `timestamptz` (nullable)
    - `status`: `enum` (TenantStatus)
    - `ssl_enabled`: `boolean` (default: false)
    - `subscription_plan_id`: `uuid` (nullable)
    - `subscription_billing_cycle`: `enum` (SubscriptionBillingCycle)
    - `subscription_status`: `enum` (SubscriptionStatus)
    - `subscription_starts_at`: `timestamptz` (nullable)
    - `subscription_ends_at`: `timestamptz` (nullable)
    - `user_id`: `uuid` (nullable)
- **Relationships**:
    - `ManyToOne` -> `SubscriptionPlanEntity` (subscription_plan_id)
    - `ManyToOne` -> `UserEntity` (user_id)
