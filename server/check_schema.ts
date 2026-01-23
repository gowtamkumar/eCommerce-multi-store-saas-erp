import { createConnection } from 'typeorm';

async function checkSchema() {
    const connection = await createConnection({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'postgres',
        password: '1995',
        database: 'multi_tenant_leanding_page',
        synchronize: false,
    });

    try {
        const rawData = await connection.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'pages';
    `);

        console.log('--- Table Schema for pages ---');
        console.table(rawData);
    } catch (error) {
        console.error('Schema check failed:', error);
    } finally {
        await connection.close();
    }
}

checkSchema();
