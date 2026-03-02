import { Uploader, UploadParams } from '@/domain/forum/application/storage/uploader'
import { EnvService } from '@/infra/env/env.service'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'

@Injectable()
export class R2Storage implements Uploader {
	private readonly client: S3Client

	constructor(private readonly envService: EnvService) {
		const accountId = this.envService.get('CLOUDFLARE_ACCOUNT_ID')
		const bucketName = this.envService.get('AWS_BUCKET_NAME')

		this.client = new S3Client({
			region: 'auto',
			endpoint: `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`,
			credentials: {
				accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
				secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY_ID'),
			},
		})
	}

	async upload({ fileName, fileType, body }: UploadParams): Promise<{ url: string }> {
		const uploadId = randomUUID()
		const uniqueFileName = `${uploadId}-${fileName}`

		await this.client.send(
			new PutObjectCommand({
				Bucket: this.envService.get('AWS_BUCKET_NAME'),
				Key: uniqueFileName,
				Body: body,
				ContentType: fileType,
			}),
		)

		return { url: uniqueFileName }
	}
}
