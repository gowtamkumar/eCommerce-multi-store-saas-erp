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

        console.log('--- Detailed Section Check ---');
        homePages.forEach((p) => {
            console.log(`Page: ${p.title} (${p.id})`);
            p.sections?.forEach((s, i) => {
                console.log(`  Section ${i} (${s.type}):`);
                console.log(`    Settings:`, JSON.stringify(s.settings, null, 2));
            });
        });
    } catch (error) {
        console.error('Diagnosis failed:', error);
    } finally {
        await connection.close();
    }
}

diagnose();
