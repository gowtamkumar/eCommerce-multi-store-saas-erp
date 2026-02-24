import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import { join } from 'path'

const envPath = process.env.NODE_ENV === 'production'
    ? '../../.env.production'
    : '../../.env.development'

config({ path: join(__dirname, envPath) })

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
    synchronize: false,
    logging: true,
})
