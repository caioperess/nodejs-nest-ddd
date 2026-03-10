import { makeAttachment } from '@test/factories/make-attachment'
import { makeQuestion } from '@test/factories/make-question'
import { makeQuestionAttachment } from '@test/factories/make-question-attachment'
import { makeStudent } from '@test/factories/make-student'
import { InMemoryAttachmentsRepository } from '@test/repositories/in-memory-attachments-repository'
import { InMemoryQuestionsAttachmentsRepository } from '@test/repositories/in-memory-questions-attachments-repository'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository'
import { InMemoryStudentsRepository } from '@test/repositories/in-memory-students-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Slug } from '../../enterprise/entities/value-objects/slug'
import { GetQuestionBySlugUseCase } from './get-question-by-slug'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryQuestionsAttachmentsRepository: InMemoryQuestionsAttachmentsRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let sut: GetQuestionBySlugUseCase

describe('Get Question by Slug', () => {
	beforeEach(() => {
		inMemoryStudentsRepository = new InMemoryStudentsRepository()
		inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
		inMemoryQuestionsAttachmentsRepository = new InMemoryQuestionsAttachmentsRepository()
		inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
			inMemoryQuestionsAttachmentsRepository,
			inMemoryAttachmentsRepository,
			inMemoryStudentsRepository,
		)
		sut = new GetQuestionBySlugUseCase(inMemoryQuestionsRepository)
	})

	it('should be able to get a question with details by slug', async () => {
		const author = makeStudent({
			name: 'John Doe',
		})

		await inMemoryStudentsRepository.create(author)

		const newQuestion = makeQuestion({
			authorId: author.id,
			slug: Slug.create('question-title'),
		})

		await inMemoryQuestionsRepository.create(newQuestion)

		const attachment1 = makeAttachment({
			title: 'Attachment 1',
		})
		const attachment2 = makeAttachment({
			title: 'Attachment 2',
		})

		await inMemoryAttachmentsRepository.create(attachment1)
		await inMemoryAttachmentsRepository.create(attachment2)
		inMemoryQuestionsAttachmentsRepository.items.push(
			makeQuestionAttachment({
				questionId: newQuestion.id,
				attachmentId: attachment1.id,
			}),
		)

		const result = await sut.execute({
			slug: 'question-title',
		})

		expect(result.value).toMatchObject({
			question: expect.objectContaining({
				title: newQuestion.title,
				author: author.name,
				attachments: [
					expect.objectContaining({
						title: attachment1.title,
					}),
				],
			}),
		})
	})

	it('should not be able to get a question by slug if it does not exist', async () => {
		const result = await sut.execute({
			slug: 'non-existent-slug',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
