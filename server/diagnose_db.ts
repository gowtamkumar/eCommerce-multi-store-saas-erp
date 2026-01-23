import { createConnection } from 'typeorm';
import { PageEntity } from './src/modules/page/entities/page.entity';
import { TenantEntity } from './src/modules/tenant/entities/tenant.entity';

async function diagnose() {
    const connection = await createConnection({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'postgres',
        password: '1995',
        database: 'multi_tenant_leanding_page',
        entities: [PageEntity, TenantEntity],
        synchronize: false,
    });

    try {
        const pageRepo = connection.getRepository(PageEntity);
        const homePages = await pageRepo.find({ where: { isHomePage: true } });

        console.log('--- Home Pages Found ---');
        homePages.forEach((p, i) => {
            console.log(`Page ${i + 1}: ${p.title} (ID: ${p.id}, Tenant: ${p.tenantId})`);
            console.log('Sections:', JSON.stringify(p.sections, null, 2));
        });
    } catch (error) {
        console.error('Diagnosis failed:', error);
    } finally {
        await connection.close();
    }
}

diagnose();
