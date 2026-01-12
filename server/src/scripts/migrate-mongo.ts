import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Entities
import { UserEntity } from '../modules/admin/user/entities/user.entity';
import { FaqEntity } from '../modules/faq/entities/faq.entity';
import { LeadEntity } from '../modules/lead/entities/lead.entity';
import { OrderEntity } from '../modules/order/entities/order.entity';
import { PageEntity } from '../modules/page/entities/page.entity';
import { PaymentEntity } from '../modules/payment/entities/payment.entity';
import { ProductEntity } from '../modules/product/entities/product.entity';
import { SiteSettingsEntity } from '../modules/settings/entities/site-settings.entity';
import { TenantEntity } from '../modules/tenant/entities/tenant.entity';
import { TestimonialEntity } from '../modules/testimonial/entities/testimonial.entity';

// Enums
import { UserRole } from '../common/enums/user/user-role.enum';
import { UserStatus } from '../common/enums/user/user-status.enum';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '101',
  database: process.env.DB_DATABASE || 'multi_tenant_leanding_page',
  entities: [
    TenantEntity,
    UserEntity,
    ProductEntity,
    SiteSettingsEntity,
    PageEntity,
    FaqEntity,
    TestimonialEntity,
    LeadEntity,
    OrderEntity,
    PaymentEntity,
  ],
  synchronize: true,
});

function mongoIdToUuid(mongoId: any): string {
  if (!mongoId) return null;
  const hex = typeof mongoId === 'string' ? mongoId : mongoId.$oid;
  if (!hex) return null;
  const padded = hex.padEnd(32, '0');
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
}

function parseMongoDate(mongoDate: any): Date {
  if (!mongoDate) return new Date();
  const dateStr = typeof mongoDate === 'string' ? mongoDate : mongoDate.$date;
  return dateStr ? new Date(dateStr) : new Date();
}

const DEFAULT_TENANT_ID = '695b94b0-492c-58d5-0f5c-9ce700000000';

async function migrate() {
  await AppDataSource.initialize();
  console.log('Database initialized');

  const baseDir = path.join(__dirname, '../../../lib/database');

  // helper to read json
  const readJson = (file: string) => {
    const filePath = path.join(baseDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  };

  const tenantRepo = AppDataSource.getRepository(TenantEntity);
  const userRepo = AppDataSource.getRepository(UserEntity);
  const productRepo = AppDataSource.getRepository(ProductEntity);
  const settingsRepo = AppDataSource.getRepository(SiteSettingsEntity);
  const pageRepo = AppDataSource.getRepository(PageEntity);
  const faqRepo = AppDataSource.getRepository(FaqEntity);
  const testimonialRepo = AppDataSource.getRepository(TestimonialEntity);
  const leadRepo = AppDataSource.getRepository(LeadEntity);
  const orderRepo = AppDataSource.getRepository(OrderEntity);
  const paymentRepo = AppDataSource.getRepository(PaymentEntity);

  async function ensureTenantExists(id: string) {
    if (!id) return;
    const exists = await tenantRepo.findOneBy({ id });
    if (!exists) {
      console.log(`Creating shell tenant for missing ID: ${id}`);
      const shell = new TenantEntity();
      shell.id = id;
      shell.storeName = id === DEFAULT_TENANT_ID ? 'Main System' : 'System Tenant';
      shell.subdomain = id === DEFAULT_TENANT_ID ? 'system' : `system-${id.slice(0, 8)}`;
      shell.planTier = 'enterprise';
      await tenantRepo.save(shell);
    }
  }

  // Clear data
  console.log('Clearing existing data...');
  await paymentRepo.createQueryBuilder().delete().execute();
  await orderRepo.createQueryBuilder().delete().execute();
  await leadRepo.createQueryBuilder().delete().execute();
  await testimonialRepo.createQueryBuilder().delete().execute();
  await faqRepo.createQueryBuilder().delete().execute();
  await pageRepo.createQueryBuilder().delete().execute();
  await settingsRepo.createQueryBuilder().delete().execute();
  await productRepo.createQueryBuilder().delete().execute();
  await userRepo.createQueryBuilder().delete().execute();
  await tenantRepo.createQueryBuilder().delete().execute();

  // 1. Tenants
  console.log('Migrating Tenants...');
  const tenants = readJson('ecommerce_multi_tenant_saas.tenants.json');
  for (const t of tenants) {
    try {
      const tenant = new TenantEntity();
      tenant.id = mongoIdToUuid(t._id);
      tenant.storeName = t.storeName;
      tenant.subdomain = t.subdomain;
      tenant.planTier = t.planTier || 'basic';
      tenant.createdAt = parseMongoDate(t.createdAt);
      tenant.updatedAt = parseMongoDate(t.updatedAt);
      await tenantRepo.save(tenant);
    } catch (e) {
      console.error(`Failed to migrate tenant ${t._id?.$oid}:`, e.message);
    }
  }
  await ensureTenantExists(DEFAULT_TENANT_ID);

  // 2. Users
  console.log('Migrating Users...');
  const users = readJson('ecommerce_multi_tenant_saas.users.json');
  for (const u of users) {
    try {
      const tid = mongoIdToUuid(u.tenantId) || DEFAULT_TENANT_ID;
      await ensureTenantExists(tid);

      const user = new UserEntity();
      user.id = mongoIdToUuid(u._id);
      user.name = u.name;
      user.email = u.email;
      user.username = u.username;
      user.password = u.password;
      user.tenantId = tid;

      // Map role
      const roleMap: any = {
        'admin': UserRole.Admin,
        'user': UserRole.User,
        'super_admin': UserRole.SuperAdmin,
        'super-admin': UserRole.SuperAdmin
      };
      user.role = roleMap[u.role] || UserRole.User;

      // Map status
      const statusMap: any = {
        'active': UserStatus.Active,
        'inactive': UserStatus.Inactive
      };
      user.status = statusMap[u.status] || UserStatus.Active;

      user.createdAt = parseMongoDate(u.createdAt);
      user.updatedAt = parseMongoDate(u.updatedAt);
      await userRepo.save(user);
    } catch (e) {
      console.error(`Failed to migrate user ${u.email}:`, e.message);
    }
  }

  // 3. Products
  console.log('Migrating Products...');
  const products = readJson('ecommerce_multi_tenant_saas.products.json');
  for (const p of products) {
    try {
      const tid = mongoIdToUuid(p.tenantId) || DEFAULT_TENANT_ID;
      await ensureTenantExists(tid);

      const product = new ProductEntity();
      product.id = mongoIdToUuid(p._id);
      product.name = p.name;
      product.slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      product.description = p.description;
      product.price = p.price;
      product.discountAmount = p.discountAmount || 0;
      product.images = p.images || [];
      product.features = p.features || [];
      product.stock = p.stock || 0;
      product.status = (p.status || 'inactive').toLowerCase() as any;
      product.tagline = p.tagline;
      product.socialProof = p.socialProof;
      product.heroHighlights = p.heroHighlights;
      product.specifications = p.specifications;
      product.keyBenefits = p.keyBenefits;
      product.videoUrl = p.videoUrl;
      product.releaseBadgeText = p.releaseBadgeText;
      product.sections = p.sections;
      product.reviewSectionType = p.reviewSectionType || 'testimonials';
      product.tenantId = tid;
      product.createdAt = parseMongoDate(p.createdAt);
      product.updatedAt = parseMongoDate(p.updatedAt);
      await productRepo.save(product);
    } catch (e) {
      console.error(`Failed to migrate product ${p.name}:`, e.message);
    }
  }

  // 4. Site Settings
  console.log('Migrating Site Settings...');
  const siteSettings = readJson('ecommerce_multi_tenant_saas.sitesettings.json');
  for (const s of siteSettings) {
    try {
      const tid = mongoIdToUuid(s.tenantId) || DEFAULT_TENANT_ID;
      await ensureTenantExists(tid);

      const settings = new SiteSettingsEntity();
      settings.id = mongoIdToUuid(s._id);
      settings.logo = s.logo || '';
      settings.brandName = s.brandName;
      settings.siteDescription = s.siteDescription;
      settings.contactEmail = s.contactEmail;
      settings.contactPhone = s.contactPhone || '';
      settings.whatsappPhone = s.whatsappPhone || '';
      settings.address = s.address || '';
      settings.currency = s.currency || 'BDT';
      settings.currencySymbol = s.currencySymbol || '৳';
      settings.supportedCurrencies = s.supportedCurrencies;
      settings.socialLinks = s.socialLinks;
      settings.productMode = s.productMode || 'single';
      settings.marketing = s.marketing;
      settings.tenantId = tid;
      settings.createdAt = parseMongoDate(s.createdAt);
      settings.updatedAt = parseMongoDate(s.updatedAt);
      await settingsRepo.save(settings);
    } catch (e) {
      console.error(`Failed to migrate site settings for tenant ${s.tenantId?.$oid || 'system'}:`, e.message);
    }
  }

  // 5. Pages
  console.log('Migrating Pages...');
  const pages = readJson('ecommerce_multi_tenant_saas.pages.json');
  for (const pg of pages) {
    try {
      const tid = mongoIdToUuid(pg.tenantId) || DEFAULT_TENANT_ID;
      await ensureTenantExists(tid);

      const page = new PageEntity();
      page.id = mongoIdToUuid(pg._id);
      page.title = pg.title;
      page.slug = pg.slug;
      page.isHomePage = pg.isHomePage || false;
      page.order = pg.order || 0;
      page.sections = pg.sections;
      page.metaTitle = pg.metaTitle;
      page.metaDescription = pg.metaDescription;
      page.status = pg.status || 'published';
      page.tenantId = tid;
      page.createdAt = parseMongoDate(pg.createdAt);
      page.updatedAt = parseMongoDate(pg.updatedAt);
      await pageRepo.save(page);
    } catch (e) {
      console.error(`Failed to migrate page ${pg.title}:`, e.message);
    }
  }

  // 6. FAQs
  console.log('Migrating FAQs...');
  const faqs = readJson('ecommerce_multi_tenant_saas.faqs.json');
  for (const f of faqs) {
    try {
      const tid = mongoIdToUuid(f.tenantId) || DEFAULT_TENANT_ID;
      await ensureTenantExists(tid);

      const faq = new FaqEntity();
      faq.id = mongoIdToUuid(f._id);
      faq.question = f.question;
      faq.answer = f.answer;
      faq.category = f.category || 'General';
      faq.order = f.order || 0;
      faq.status = (f.status || 'active').toLowerCase() as any;
      faq.tenantId = tid;
      faq.createdAt = parseMongoDate(f.createdAt);
      faq.updatedAt = parseMongoDate(f.updatedAt);
      await faqRepo.save(faq);
    } catch (e) {
      console.error(`Failed to migrate faq ${f._id?.$oid}:`, e.message);
    }
  }

  // 7. Testimonials
  console.log('Migrating Testimonials...');
  const testimonials = readJson('ecommerce_multi_tenant_saas.testimonials.json');
  for (const t of testimonials) {
    try {
      const tid = mongoIdToUuid(t.tenantId) || DEFAULT_TENANT_ID;
      await ensureTenantExists(tid);

      const testimonial = new TestimonialEntity();
      testimonial.id = mongoIdToUuid(t._id);
      testimonial.author = t.author;
      testimonial.role = t.role;
      testimonial.content = t.content;
      testimonial.rating = t.rating || 5;
      testimonial.avatar = t.avatar || '';
      testimonial.status = t.status || 'active';
      testimonial.tenantId = tid;
      testimonial.createdAt = parseMongoDate(t.createdAt);
      testimonial.updatedAt = parseMongoDate(t.updatedAt);
      await testimonialRepo.save(testimonial);
    } catch (e) {
      console.error(`Failed to migrate testimonial ${t.author}:`, e.message);
    }
  }

  // 8. Leads
  console.log('Migrating Leads...');
  const leads = readJson('ecommerce_multi_tenant_saas.leads.json');
  for (const l of leads) {
    try {
      const tid = mongoIdToUuid(l.tenantId) || DEFAULT_TENANT_ID;
      await ensureTenantExists(tid);

      const lead = new LeadEntity();
      lead.id = mongoIdToUuid(l._id);
      lead.name = l.name;
      lead.email = l.email;
      lead.phone = l.phone;
      lead.address = l.address;
      lead.subject = l.subject;
      lead.message = l.message;
      lead.status = (l.status || 'new').toLowerCase() as any;
      lead.tenantId = tid;
      lead.createdAt = parseMongoDate(l.createdAt);
      lead.updatedAt = parseMongoDate(l.updatedAt);
      await leadRepo.save(lead);
    } catch (e) {
      console.error(`Failed to migrate lead ${l.email}:`, e.message);
    }
  }

  // 9. Orders
  console.log('Migrating Orders...');
  const orders = readJson('ecommerce_multi_tenant_saas.orders.json');
  for (const o of orders) {
    try {
      const tid = mongoIdToUuid(o.tenantId) || DEFAULT_TENANT_ID;
      const pid = mongoIdToUuid(o.productId);
      await ensureTenantExists(tid);

      const order = new OrderEntity();
      order.id = mongoIdToUuid(o._id);
      order.customerName = o.customerName;
      order.customerEmail = o.customerEmail;
      order.customerPhone = o.customerPhone;
      order.address = o.address;
      order.productId = pid;
      order.quantity = o.quantity || 1;
      order.unitPrice = o.unitPrice;
      order.discountAmount = o.discountAmount || 0;
      order.totalAmount = o.totalAmount;
      order.currency = o.currency || 'BDT';
      order.currencyRate = o.currencyRate || 1;
      order.status = (o.status || 'pending').toLowerCase() as any;
      order.paymentMethod = (o.paymentMethod || 'cod').toLowerCase() as any;
      order.paymentStatus = (o.paymentStatus || 'pending').toLowerCase() as any;
      order.transactionId = o.transactionId;
      order.orderNotes = o.orderNotes;
      order.userId = mongoIdToUuid(o.userId);
      order.tenantId = tid;
      order.createdAt = parseMongoDate(o.createdAt);
      order.updatedAt = parseMongoDate(o.updatedAt);
      await orderRepo.save(order);
    } catch (e) {
      console.error(`Failed to migrate order ${o._id?.$oid}:`, e.message);
    }
  }

  // 10. Payments
  console.log('Migrating Payments...');
  const payments = readJson('ecommerce_multi_tenant_saas.payments.json');
  for (const p of payments) {
    try {
      const tid = mongoIdToUuid(p.tenantId) || DEFAULT_TENANT_ID;
      await ensureTenantExists(tid);

      const payment = new PaymentEntity();
      payment.id = mongoIdToUuid(p._id);
      payment.orderId = mongoIdToUuid(p.orderId);
      payment.transactionId = p.transactionId;
      payment.amount = p.amount;
      payment.currency = p.currency || 'BDT';
      payment.method = p.method;
      payment.status = p.status;
      payment.gatewayResponse = p.gatewayResponse;
      payment.tenantId = tid;
      payment.createdAt = parseMongoDate(p.createdAt);
      payment.updatedAt = parseMongoDate(p.updatedAt);
      await paymentRepo.save(payment);
    } catch (e) {
      console.error(`Failed to migrate payment ${p._id?.$oid}:`, e.message);
    }
  }

  console.log('Migration completed successfully!');
  await AppDataSource.destroy();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
