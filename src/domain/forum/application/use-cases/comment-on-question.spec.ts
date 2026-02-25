import { makeQuestion } from '@test/factories/make-question'
import { InMemoryQuestionCommentsRepository } from '@test/repositories/in-memory-question-comments-repository'
import { InMemoryQuestionsAttachmentsRepository } from '@test/repositories/in-memory-questions-attachments-repository'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { CommentOnQuestionUseCase } from './comment-on-question'

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionsAttachmentsRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let sut: CommentOnQuestionUseCase

describe('CommentOnQuestionUseCase', () => {
	beforeEach(() => {
		inMemoryQuestionAttachmentsRepository = new InMemoryQuestionsAttachmentsRepository()
		inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository()
		inMemoryQuestionsRepository = new InMemoryQuestionsRepository(inMemoryQuestionAttachmentsRepository)

		sut = new CommentOnQuestionUseCase(inMemoryQuestionsRepository, inMemoryQuestionCommentsRepository)
	})

	it('should be able to comment on a question', async () => {
		const question = makeQuestion({}, new UniqueEntityID('question-1'))

		await inMemoryQuestionsRepository.create(question)

		const result = await sut.execute({
			authorId: '1',
			questionId: question.id.toString(),
			content: 'Question content',
		})

		expect(result.isRight()).toBe(true)
		expect(result.value).toMatchObject({
			questionComment: expect.objectContaining({
				questionId: question.id,
				content: 'Question content',
			}),
		})
	})

	it('should not be able to comment on a non existing question', async () => {
		const result = await sut.execute({
			questionId: '1',
			authorId: '1',
			content: 'Question content',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
