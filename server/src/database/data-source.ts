import { config } from 'dotenv'
import { join } from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'

// Standardize env loading for CLI (two levels up from src/database)
const isProduction = process.env.NODE_ENV === 'production'
const envFile = isProduction ? '.env.production' : '.env.development'
config({ path: join(process.cwd(), envFile) })

// Schema auto-sync is dangerous in production: it can silently alter/drop
// columns and conflict with migrations. Default it OFF in production and ON
// elsewhere, but always allow an explicit DB_SYNCHRONIZE override.
const synchronize =
  process.env.DB_SYNCHRONIZE !== undefined ? process.env.DB_SYNCHRONIZE === 'true' : !isProduction

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
  synchronize,
  // Opt-in: apply pending migrations on boot (recommended in production where
  // synchronize is off). Defaults off to avoid surprising boot-time changes.
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  logging: false,
}

export const AppDataSource = new DataSource(dataSourceOptions)
