import { makeQuestion } from '@test/factories/make-question'
import { makeQuestionAttachment } from '@test/factories/make-question-attachment'
import { InMemoryQuestionsAttachmentsRepository } from '@test/repositories/in-memory-questions-attachments-repository'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository'
import { expect } from 'node_modules/vitest/dist'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DeleteQuestionUseCase } from './delete-question'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionsAttachmentsRepository
let sut: DeleteQuestionUseCase

describe('Delete Question', () => {
	beforeEach(() => {
		inMemoryQuestionAttachmentsRepository = new InMemoryQuestionsAttachmentsRepository()
		inMemoryQuestionsRepository = new InMemoryQuestionsRepository(inMemoryQuestionAttachmentsRepository)
		sut = new DeleteQuestionUseCase(inMemoryQuestionsRepository)
	})

	it('should be able to delete a question', async () => {
		const newQuestion = makeQuestion({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('question-id'))

		await inMemoryQuestionsRepository.create(newQuestion)

		inMemoryQuestionAttachmentsRepository.items.push(
			makeQuestionAttachment({ questionId: newQuestion.id, attachmentId: new UniqueEntityID('1') }),
			makeQuestionAttachment({ questionId: newQuestion.id, attachmentId: new UniqueEntityID('2') }),
		)

		await sut.execute({
			questionId: 'question-id',
			authorId: 'author-id',
		})

		expect(inMemoryQuestionsRepository.items).toHaveLength(0)
		expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(0)
	})

	it('should not be able to delete a question if it does not exist', async () => {
		const result = await sut.execute({
			questionId: 'non-existent-question-id',
			authorId: 'author-id',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to delete a question from other user', async () => {
		const newQuestion = makeQuestion({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('question-id'))

		await inMemoryQuestionsRepository.create(newQuestion)

		const result = await sut.execute({
			questionId: 'question-id',
			authorId: 'other-author-id',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
