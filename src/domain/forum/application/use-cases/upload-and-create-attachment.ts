import { type Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Attachment } from '../../enterprise/entities/attachment'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { Uploader } from '../storage/uploader'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'

interface UploadAndCreateAttachmentUseCaseParams {
	fileName: string
	fileType: string
	body: Buffer
}

type UploadAndCreateAttachmentUseCaseResponse = Either<InvalidAttachmentTypeError, { attachment: Attachment }>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
	constructor(
		private readonly attachmentsRepository: AttachmentsRepository,
		private readonly uploader: Uploader,
	) {}

	async execute({
		fileName,
		fileType,
		body,
	}: UploadAndCreateAttachmentUseCaseParams): Promise<UploadAndCreateAttachmentUseCaseResponse> {
		const mimeTypeRegex = /^image\/(jpeg|png|jpg)$|^application\/pdf$/

		const isValidFileType = mimeTypeRegex.test(fileType)

		if (!isValidFileType) {
			return left(new InvalidAttachmentTypeError(fileType))
		}

		const { url } = await this.uploader.upload({
			fileName,
			fileType,
			body,
		})

		const attachment = Attachment.create({
			title: fileName,
			url,
		})

		await this.attachmentsRepository.create(attachment)

		return right({ attachment })
	}
}
