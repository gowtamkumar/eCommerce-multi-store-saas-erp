import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataSourceOptions } from './data-source'

export const databaseProvider = [
  TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
  }),
]
