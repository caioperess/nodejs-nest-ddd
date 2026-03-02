import { InMemoryAttachmentsRepository } from '@test/repositories/in-memory-attachments-repository'
import { FakeUploader } from '@test/storage/fake-uploader'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let uploader: FakeUploader
let sut: UploadAndCreateAttachmentUseCase

describe('UploadAndCreateAttachmentUseCase', () => {
	beforeEach(() => {
		inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
		uploader = new FakeUploader()
		sut = new UploadAndCreateAttachmentUseCase(inMemoryAttachmentsRepository, uploader)
	})

	it('should be able to upload and create an attachment', async () => {
		const result = await sut.execute({
			fileName: 'profile.png',
			fileType: 'image/png',
			body: Buffer.from(''),
		})

		expect(result.isRight()).toBe(true)
		expect(result.value).toEqual({
			attachment: inMemoryAttachmentsRepository.items[0],
		})
		expect(uploader.uploads).toHaveLength(1)
		expect(uploader.uploads[0]).toEqual(
			expect.objectContaining({
				fileName: 'profile.png',
			}),
		)
	})

	it('should not be able to upload and create an attachment if the mimetype is invalid', async () => {
		const result = await sut.execute({
			fileName: 'profile.mp3',
			fileType: 'audio/mpeg',
			body: Buffer.from(''),
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
	})
})
