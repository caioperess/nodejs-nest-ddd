import {
	BadRequestException,
	Controller,
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadAndCreateAttachmentUseCase } from '@/domain/forum/application/use-cases/upload-and-create-attachment'

@Controller('/attachments')
export class UploadAttachmentController {
	constructor(private readonly uploadAndCreateAttachmentUseCase: UploadAndCreateAttachmentUseCase) {}

	@Post()
	@UseInterceptors(FileInterceptor('file'))
	async handle(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({
						maxSize: 1024 * 1024 * 2, // 2mb
					}),
					new FileTypeValidator({ fileType: '.(jpg|jpeg|png|pdf)' }),
				],
			}),
		)
		file: Express.Multer.File,
	) {
		const fileName = file.originalname
		const fileType = file.mimetype
		const body = file.buffer

		const result = await this.uploadAndCreateAttachmentUseCase.execute({
			fileName,
			fileType,
			body,
		})

		if (result.isLeft()) {
			const error = result.value
			console.log(error)

			throw new BadRequestException(error.message)
		}

		const { attachment } = result.value

		return {
			attachmentId: attachment.id.toString(),
		}
	}
}
