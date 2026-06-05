import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name)
  private minioClient: Minio.Client
  private presignedClient: Minio.Client
  private bucketName: string
  private publicEndpointUrl: string

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'minio')
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10)
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin')
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin')
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true'
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'erp-media')
    const region = this.configService.get<string>('MINIO_REGION', 'us-east-1')

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
      region,
    })

    const publicHost = this.configService.get<string>('MINIO_PUBLIC_HOST', 'localhost')
    const publicPort = parseInt(
      this.configService.get<string>('MINIO_PUBLIC_PORT', port.toString()),
      10,
    )
    const publicUseSSL =
      this.configService.get<string>('MINIO_PUBLIC_USE_SSL', useSSL ? 'true' : 'false') === 'true'

    this.presignedClient = new Minio.Client({
      endPoint: publicHost,
      port: publicPort,
      useSSL: publicUseSSL,
      accessKey,
      secretKey,
      region,
    })

    const isSSL = publicUseSSL ? 'https' : 'http'
    this.publicEndpointUrl = `${isSSL}://${publicHost}:${publicPort}`
  }

  async onModuleInit() {
    try {
      this.logger.log(`Checking if MinIO bucket "${this.bucketName}" exists...`)
      const bucketExists = await this.minioClient.bucketExists(this.bucketName)
      if (!bucketExists) {
        this.logger.log(`Creating MinIO bucket "${this.bucketName}"...`)
        await this.minioClient.makeBucket(this.bucketName)
      } else {
        this.logger.log(`MinIO bucket "${this.bucketName}" already exists.`)
      }

      // Define public-read policy
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      }

      this.logger.log(`Setting public-read policy on MinIO bucket "${this.bucketName}"...`)
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy))
      this.logger.log(
        `MinIO bucket "${this.bucketName}" public-read policy configured successfully.`,
      )
    } catch (error: any) {
      this.logger.error(`Error initializing MinIO client/bucket: ${error.message}`, error.stack)
    }
  }

  async getPresignedPutUrl(objectName: string, expiryInSeconds = 3600): Promise<string> {
    return await this.presignedClient.presignedUrl(
      'PUT',
      this.bucketName,
      objectName,
      expiryInSeconds,
    )
  }

  getPublicUrl(objectName: string): string {
    return `${this.publicEndpointUrl}/${this.bucketName}/${objectName}`
  }

  getBucketName(): string {
    return this.bucketName
  }
}
