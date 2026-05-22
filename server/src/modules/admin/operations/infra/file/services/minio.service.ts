import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name)
  private minioClient: Minio.Client
  private bucketName: string
  private publicEndpointUrl: string

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'minio')
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10)
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin')
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin')
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true'
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'erp-media')

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    })

    // Compute the public endpoint url.
    // If the server runs inside docker, it uses the host name 'minio:9000' internally,
    // but the client-side needs to use the browser-accessible URL (usually 'http://localhost:9000').
    // So we can fallback to localhost or let the config define it.
    const isSSL = useSSL ? 'https' : 'http'
    this.publicEndpointUrl = `${isSSL}://localhost:${port}`
  }

  async onModuleInit() {
    try {
      this.logger.log(`Checking if MinIO bucket "${this.bucketName}" exists...`)
      const bucketExists = await this.minioClient.bucketExists(this.bucketName)
      if (!bucketExists) {
        this.logger.log(`Creating MinIO bucket "${this.bucketName}"...`)
        await this.minioClient.makeBucket(this.bucketName)
        
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

        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy))
        this.logger.log(`MinIO bucket "${this.bucketName}" public-read policy configured successfully.`)
      } else {
        this.logger.log(`MinIO bucket "${this.bucketName}" already exists.`)
      }
    } catch (error) {
      this.logger.error(`Error initializing MinIO client/bucket: ${error.message}`, error.stack)
    }
  }

  async getPresignedPutUrl(objectName: string, expiryInSeconds = 3600): Promise<string> {
    return await this.minioClient.presignedUrl('PUT', this.bucketName, objectName, expiryInSeconds)
  }

  getPublicUrl(objectName: string): string {
    return `${this.publicEndpointUrl}/${this.bucketName}/${objectName}`
  }

  getBucketName(): string {
    return this.bucketName
  }
}
