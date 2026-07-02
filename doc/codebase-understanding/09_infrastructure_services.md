# Codebase Understanding — Infrastructure Services Module

This document covers all shared infrastructure services that are consumed by all business modules: file storage, email delivery, SMS, push notifications, in-app notifications, real-time chat (WebSocket), BullMQ queue management, and Redis caching.

---

## Module Location

```
server/src/modules/admin/operations/infra/
├── cache/                            # Redis cache-aside wrapper
│   ├── cache.module.ts
│   ├── cache.service.ts              # Store-scoped get/set/del helpers
│   └── cache.repository.ts           # Low-level Redis driver abstraction
├── chat/                             # Real-time live chat (Socket.IO)
│   ├── entities/
│   │   ├── conversation.entity.ts    # Chat session between agent and customer
│   │   └── chat-message.entity.ts    # Individual chat messages
│   ├── chat.gateway.ts               # Socket.IO WebSocket gateway
│   ├── chat.service.ts
│   └── chat.controller.ts
├── file/                             # File/media upload and management
│   ├── entities/                     # Upload record metadata
│   ├── services/                     # S3-compatible upload pipeline
│   ├── controllers/                  # Signed URL generation, file listing
│   └── file.repository.ts
├── mail/                             # Transactional email delivery (~11KB)
│   └── mail.service.ts
├── notification/                     # In-app real-time notifications
│   ├── entities/
│   │   └── notification.entity.ts
│   ├── notification.gateway.ts       # Socket.IO push to user room
│   ├── notification.service.ts
│   └── notification.controller.ts
├── push/                             # Mobile push notifications (FCM)
│   ├── entities/                     # Device token registry
│   ├── push.service.ts
│   └── push.controller.ts
├── queue/                            # BullMQ queue module registration
│   └── queue.module.ts
└── sms/                              # SMS OTP and alert delivery
    └── sms.service.ts
```

---

## 1. Redis Cache Service (`cache/cache.service.ts`)

All cache operations are **store-scoped** using the key prefix convention `t:{storeId}:...`.

### Key Methods

| Method | Signature | Description |
| :--- | :--- | :--- |
| `get()` | `get(ctx, module, key)` | Retrieve a cached value |
| `set()` | `set(ctx, module, key, value, ttl?)` | Store value with optional TTL (default 10 min) |
| `del()` | `del(ctx, module, key)` | Invalidate a specific cache key |
| `delByPattern()` | `delByPattern(ctx, module)` | Bulk-invalidate all keys for a module |

### Cache Key Convention

```
t:{storeId}:{module}:{resource}:{identifier}
```

**Examples:**
- `t:abc-123:catalog:products:list` — product list cache
- `t:abc-123:reports:pl:2026-01:2026-01` — P&L report cache
- `t:abc-123:subscription:features` — plan entitlements cache (TTL: 1 hour)
- `t:abc-123:auth:user:user-uuid` — authenticated user record cache

---

## 2. BullMQ Queue Module (`queue/queue.module.ts`)

The queue module registers all BullMQ queue names as injectable tokens. The queues are consumed by worker processors co-located with their owning modules.

### Registered Queues

| Queue Name | Purpose | Processor Location |
| :--- | :--- | :--- |
| `stock-update` | Inventory ledger writes after sales/GRN/transfers | `inventory-transaction/queue/` |
| `journal-post` | Accounting GL journal entries from outbox | `accounting/services/accounting-outbox.service.ts` |
| `email` | Transactional emails (order confirmations, payslips) | `infra/mail/mail.service.ts` |
| `notification` | In-app notification dispatching | `infra/notification/notification.service.ts` |
| `push` | Mobile FCM push messages | `infra/push/push.service.ts` |
| `reports` | Heavy scheduled report generation | `finance/report/report.service.ts` |
| `dunning` | Daily AR collection task | `accounting/services/dunning.service.ts` |
| `reservation-expire` | Expired stock reservation cleanup | `inventory-transaction/stock-reservation-scheduler.service.ts` |

### Job Schema Rules
- Every job payload **must** include `storeId`
- Every job uses a deterministic `jobId` for idempotency (e.g. `stock:orderId:itemId`)
- Workers validate `storeId` presence before processing and reject orphan jobs

---

## 3. File Upload Service (`file/`)

Manages all binary media uploads across catalog images, employee documents, receipts, and report exports.

### Upload Path Convention
```
t/{storeId}/{domain}/{hash}-{filename}
```

**Examples:**
- `t/abc-123/catalog/a1b2c3-product-photo.jpg`
- `t/abc-123/hrm/e4f5g6-employee-nid-scan.pdf`
- `t/abc-123/reports/h7i8j9-pl-2026-01.xlsx`

### Key Behaviours
- Files are stored on an **S3-compatible** object storage backend (configurable via environment)
- A **signed URL** (time-limited) is returned for every download — no public bucket access
- Metadata (filename, mime type, size, uploader, storeId) is recorded in the database

---

## 4. Mail Service (`mail/mail.service.ts`)

Delivers transactional emails via a configurable SMTP or API provider (e.g. SendGrid, Mailgun).

### Email Templates Handled
| Trigger | Email Sent |
| :--- | :--- |
| New staff invitation | Welcome / Set-password link |
| Order placed (online) | Order confirmation with items |
| Order shipped | Shipping tracking link |
| Payroll approved | Payslip PDF attachment |
| Leave approved/rejected | Leave status update |
| Low stock alert | Stock warning to procurement |
| Dunning rule triggered | AR payment reminder |
| Password reset | Reset link email |

---

## 5. Real-Time Chat (`chat/`)

Implements a live support chat system between customers and store support agents using **Socket.IO**.

### Entities
- **`ConversationEntity`:** Session record. Holds `customerId`, `assignedAgentId`, `status` (OPEN, RESOLVED, CLOSED), and timestamps.
- **`ChatMessageEntity`:** Individual messages. Fields: `conversationId`, `senderId`, `senderType` (CUSTOMER, AGENT), `content`, `readAt`.

### Gateway (`chat.gateway.ts`)
- Customers connect via the storefront WebSocket namespace `/chat`
- Agents connect via the admin panel namespace `/admin/chat`
- Messages are broadcast to the conversation room using `socket.io` room grouping by `conversationId`
- New customer message triggers a notification to the assigned agent

---

## 6. In-App Notification (`notification/`)

Push real-time UI toasts and notification bell updates to admin panel users.

### `NotificationEntity`
Fields: `userId`, `storeId`, `type` (ORDER_PLACED, STOCK_LOW, LEAVE_APPROVED, etc.), `message`, `isRead`, `resourceType`, `resourceId`.

### `NotificationGateway` (Socket.IO)
- Each admin user joins a personal Socket.IO room on login (`user:{userId}`)
- New notifications are pushed via `server.to('user:xyz').emit('notification', payload)`

---

## 7. Push Notification (`push/`)

Sends mobile push alerts via **Firebase Cloud Messaging (FCM)**.

- Device FCM tokens are stored in the push entities table per user
- `PushService.send()` dispatches to all registered devices of the target user
- Used for: new order alerts for cashiers, approval request alerts for managers

---

## 8. SMS Service (`sms/sms.service.ts`)

Delivers OTP codes and transactional alerts via SMS gateway integration.

- OTP delivery for login verification and password resets
- Order status SMS updates to customers
- Configurable via environment variable to switch SMS provider
