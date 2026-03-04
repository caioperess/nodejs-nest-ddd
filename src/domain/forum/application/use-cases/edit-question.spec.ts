import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makeQuestion } from '@test/factories/make-question'
import { makeQuestionAttachment } from '@test/factories/make-question-attachment'
import { InMemoryQuestionsAttachmentsRepository } from '@test/repositories/in-memory-questions-attachments-repository'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository'
import { expect } from 'node_modules/vitest/dist'
import { EditQuestionUseCase } from './edit-question'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionsAttachmentsRepository
let sut: EditQuestionUseCase

describe('Edit Question', () => {
	beforeEach(() => {
		inMemoryQuestionAttachmentsRepository = new InMemoryQuestionsAttachmentsRepository()
		inMemoryQuestionsRepository = new InMemoryQuestionsRepository(inMemoryQuestionAttachmentsRepository)
		sut = new EditQuestionUseCase(inMemoryQuestionsRepository, inMemoryQuestionAttachmentsRepository)
	})

	it('should be able to edit a question', async () => {
		const newQuestion = makeQuestion({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('question-id'))

		await inMemoryQuestionsRepository.create(newQuestion)

		inMemoryQuestionAttachmentsRepository.items.push(
			makeQuestionAttachment({ questionId: newQuestion.id, attachmentId: new UniqueEntityID('1') }),
			makeQuestionAttachment({ questionId: newQuestion.id, attachmentId: new UniqueEntityID('2') }),
		)

		await sut.execute({
			questionId: 'question-id',
			authorId: 'author-id',
			title: 'Question title',
			content: 'Question content',
			attachmentsIds: ['1', '3'],
		})

		expect(inMemoryQuestionsRepository.items[0].title).toBe('Question title')
		expect(inMemoryQuestionsRepository.items[0].content).toBe('Question content')
		expect(inMemoryQuestionsRepository.items[0].attachments.currentItems).toHaveLength(2)
		expect(inMemoryQuestionsRepository.items[0].attachments.currentItems).toEqual([
			expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
			expect.objectContaining({ attachmentId: new UniqueEntityID('3') }),
		])
	})

	it('should not be able to edit a question if it does not exist', async () => {
		const result = await sut.execute({
			questionId: 'non-existent-question-id',
			authorId: 'author-id',
			title: 'Question title',
			content: 'Question content',
			attachmentsIds: [],
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to edit a question from other user', async () => {
		const newQuestion = makeQuestion({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('question-id'))

		await inMemoryQuestionsRepository.create(newQuestion)

		const result = await sut.execute({
			questionId: 'question-id',
			authorId: 'other-author-id',
			title: 'Question title',
			content: 'Question content',
			attachmentsIds: [],
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
