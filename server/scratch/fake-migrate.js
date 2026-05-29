const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const migrationsDir = path.join(__dirname, '../src/database/migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.ts'));

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5434,
    user: 'postgres',
    password: 'postgres',
    database: 'multi_tenant_ecommerce',
  });

  await client.connect();

  // Create migrations table if not exists (TypeORM does this, but let's be safe)
  await client.query(`
    CREATE TABLE IF NOT EXISTS "migrations" (
      "id" SERIAL PRIMARY KEY,
      "timestamp" bigint NOT NULL,
      "name" character varying NOT NULL
    )
  `);

  const { rows } = await client.query('SELECT name FROM migrations');
  const existingNames = new Set(rows.map(r => r.name));

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find class name in the file, e.g. "export class InitialBaseline1774867892750"
    const match = content.match(/export class (\w+)/);
    if (!match) {
      console.log(`Skipping ${file}: no class match`);
      continue;
    }
    
    const className = match[1];
    
    // Get timestamp from filename, e.g., "1774867892750-InitialBaseline.ts" -> 1774867892750
    const tsMatch = file.match(/^(\d+)/);
    if (!tsMatch) {
      console.log(`Skipping ${file}: no timestamp prefix`);
      continue;
    }
    
    const timestamp = parseInt(tsMatch[1], 10);
    
    if (existingNames.has(className)) {
      console.log(`Migration ${className} already recorded.`);
    } else {
      console.log(`Inserting migration: ${className} with timestamp ${timestamp}`);
      await client.query(
        'INSERT INTO migrations (timestamp, name) VALUES ($1, $2)',
        [timestamp, className]
      );
    }
  }

  await client.end();
  console.log('Fake migration recording complete!');
}

main().catch(console.error);
