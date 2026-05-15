import { config } from 'dotenv'
import { join } from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'

// Standardize env loading for CLI (two levels up from src/database)
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
config({ path: join(process.cwd(), envFile) })

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
  synchronize: true,
  logging: true,
  migrationsRun: true,
}

export const AppDataSource = new DataSource(dataSourceOptions)
