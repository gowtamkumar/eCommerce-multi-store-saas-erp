# Ecommerce Project Database Schema

This document outlines the database schema for the Ecommerce Landing project, built using Mongoose.

## Models Summary

| Model | Description |
| :--- | :--- |
| **[Tenant](#tenant)** | Tenant/Store configuration and details. |
| **[User](#user)** | System users and administrators. |
| **[Product](#product)** | E-commerce products and details. |
| **[Order](#order)** | Customer orders and status. |
| **[Payment](#payment)** | Payment transaction records. |
| **[Review](#review)** | Product reviews and ratings. |
| **[Lead](#lead)** | Contact form submissions and leads. |
| **[SiteSettings](#sitesettings)** | Global application and marketing settings. |
| **[Page](#page)** | Dynamic landing page content and sections. |
| **[FAQ](#faq)** | Frequently Asked Questions. |
| **[Testimonial](#testimonial)** | User testimonials. |
| **[Media](#media)** | Uploaded media file metadata. |

---

## Model Details

### Tenant
Store/Tenant configuration (Multi-tenancy root).
- **`storeName`**: `String` (Required)
- **`subdomain`**: `String` (Required, Unique)
- **`customDomain`**: `String` (Unique, Optional)
- **`planTier`**: `String` (Enum: `basic`, `pro`, `enterprise`; Default: `basic`)
- **Timestamps**: `createdAt`, `updatedAt`

### User
System users who can manage the platform.
- **`name`**: `String` (Required)
- **`username`**: `String` (Required, Unique)
- **`email`**: `String` (Required, Unique)
- **`password`**: `String` (Required)
- **`role`**: `String` (Enum: `admin`, `user`; Default: `user`)
- **`phone`**: `String` (Optional)
- **`address`**: `String` (Optional)
- **`image`**: `String` (Optional)
- **`status`**: `String` (Enum: `active`, `blocked`; Default: `active`)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### Product
The core items being sold.
- **`name`**: `String` (Required)
- **`description`**: `String` (Required)
- **`price`**: `Number` (Required)
- **`discountAmount`**: `Number` (Default: `0`)
- **`images`**: `[String]` (Required)
- **`features`**: `[String]` (Required)
- **`stock`**: `Number` (Default: `0`)
- **`status`**: `String` (Enum: `ACTIVE`, `INACTIVE`; Default: `INACTIVE`)
- **`tagline`**: `String` (Optional)
- **`socialProof`**: `Object` (noun, count, rating, avatars)
- **`heroHighlights`**: `Array` (icon, label, value, color)
- **`specifications`**: `Array` (label, value)
- **`keyBenefits`**: `Array` (icon, title, description, color)
- **`videoUrl`**: `String` (Optional)
- **`releaseBadgeText`**: `String` (Default: `""`)
- **`sections`**: `Object` (techSpecs, features)
- **`reviewSectionType`**: `String` (Enum: `testimonials`, `reviews`; Default: `testimonials`)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### Order
Customer purchase records.
- **`customerName`**: `String` (Required)
- **`customerEmail`**: `String` (Required)
- **`customerPhone`**: `String` (Required)
- **`address`**: `String` (Required)
- **`productId`**: `ObjectId` (Ref: `Product`, Required)
- **`quantity`**: `Number` (Required, Min: `1`)
- **`unitPrice`**: `Number` (Required)
- **`discountAmount`**: `Number` (Default: `0`)
- **`totalAmount`**: `Number` (Required)
- **`currency`**: `String` (Default: `BDT`)
- **`currencyRate`**: `Number` (Default: `1`)
- **`status`**: `String` (Enum: `PENDING`, `COMPLETED`, `CANCELLED`; Default: `PENDING`)
- **`paymentMethod`**: `String` (Enum: `COD`, `SSLCOMMERZ`, Required)
- **`paymentStatus`**: `String` (Enum: `PENDING`, `PAID`, `FAILED`; Default: `PENDING`)
- **`transactionId`**: `String` (Optional)
- **`orderNotes`**: `String` (Optional)
- **`userId`**: `ObjectId` (Optional)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### Payment
Details of payment transactions.
- **`orderId`**: `ObjectId` (Ref: `Order`, Required)
- **`transactionId`**: `String` (Required)
- **`amount`**: `Number` (Required)
- **`currency`**: `String` (Default: `BDT`)
- **`method`**: `String` (Required)
- **`status`**: `String` (Required)
- **`gatewayResponse`**: `Mixed` (Optional)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### Review
Customer reviews for products.
- **`productId`**: `ObjectId` (Ref: `Product`, Required)
- **`customerName`**: `String` (Required)
- **`customerEmail`**: `String` (Required)
- **`rating`**: `Number` (Required, 1-5)
- **`comment`**: `String` (Required)
- **`status`**: `String` (Enum: `PENDING`, `APPROVED`, `REJECTED`; Default: `PENDING`)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### Lead
Contact form submissions.
- **`name`**: `String` (Required)
- **`email`**: `String` (Required)
- **`phone`**: `String` (Optional)
- **`address`**: `String` (Optional)
- **`subject`**: `String` (Required)
- **`message`**: `String` (Required)
- **`status`**: `String` (Enum: `NEW`, `READ`, `REPLIED`; Default: `NEW`)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### SiteSettings
Global application configuration.
- **`brandName`**: `String` (Default: `LuxeAudio`)
- **`siteDescription`**: `String`
- **`contactEmail`**: `String`
- **`contactPhone`**: `String`
- **`whatsappPhone`**: `String`
- **`address`**: `String`
- **`currency`**: `String` (Default: `BDT`)
- **`currencySymbol`**: `String` (Default: `৳`)
- **`supportedCurrencies`**: `Array` (code, symbol, rate, name)
- **`socialLinks`**: `Object` (facebook, twitter, instagram, linkedin)
- **`marketing`**: `Object` (googleAnalyticsId, googleSiteVerification, facebookPixelId, facebookDomainVerification)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### Page
Dynamic page content management.
- **`title`**: `String` (Required)
- **`slug`**: `String` (Required, Unique)
- **`content`**: `String` (Optional)
- **`contentType`**: `String` (Enum: `html`, `markdown`; Default: `markdown`)
- **`metaDescription`**: `String` (Optional)
- **`status`**: `String` (Enum: `draft`, `published`; Default: `draft`)
- **`sections`**: `Array` of Objects
    - `id`: `String`
    - `type`: `Enum` (hero, content, features, faq, cta, testimonials, products)
    - `content`: `Mixed`
    - `order`: `Number`
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### FAQ
Frequently Asked Questions.
- **`question`**: `String` (Required)
- **`answer`**: `String` (Required)
- **`category`**: `String` (Default: `General`)
- **`order`**: `Number` (Default: `0`)
- **`status`**: `String` (Enum: `ACTIVE`, `INACTIVE`; Default: `ACTIVE`)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### Testimonial
User testimonials and feedback.
- **`author`**: `String` (Required)
- **`role`**: `String` (Required)
- **`content`**: `String` (Required)
- **`rating`**: `Number` (Required, 1-5)
- **`avatar`**: `String` (Default: placeholder class)
- **`status`**: `String` (Enum: `active`, `inactive`; Default: `active`)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **Timestamps**: `createdAt`, `updatedAt`

### Media
Metadata for uploaded files.
- **`filename`**: `String` (Required)
- **`url`**: `String` (Required)
- **`mimetype`**: `String` (Optional)
- **`size`**: `Number` (Optional)
- **`tenantId`**: `ObjectId` (Ref: `Tenant`, Required)
- **`createdAt`**: `Date` (Default: `now`)
