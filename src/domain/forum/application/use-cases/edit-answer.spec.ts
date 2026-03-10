import { makeAnswer } from '@test/factories/make-answer'
import { makeAnswerAttachment } from '@test/factories/make-answer-attachment'
import { InMemoryAnswersAttachmentsRepository } from '@test/repositories/in-memory-answer-attachments-repository'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { EditAnswerUseCase } from './edit-answer'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswersAttachmentsRepository
let sut: EditAnswerUseCase

describe('Edit Answer', () => {
	beforeEach(() => {
		inMemoryAnswerAttachmentsRepository = new InMemoryAnswersAttachmentsRepository()
		inMemoryAnswersRepository = new InMemoryAnswersRepository(inMemoryAnswerAttachmentsRepository)
		sut = new EditAnswerUseCase(inMemoryAnswersRepository, inMemoryAnswerAttachmentsRepository)
	})

	it('should be able to edit a answer', async () => {
		const newAnswer = makeAnswer({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('answer-id'))

		await inMemoryAnswersRepository.create(newAnswer)

		inMemoryAnswerAttachmentsRepository.items.push(
			makeAnswerAttachment({ answerId: newAnswer.id, attachmentId: new UniqueEntityID('1') }),
			makeAnswerAttachment({ answerId: newAnswer.id, attachmentId: new UniqueEntityID('2') }),
		)

		await sut.execute({
			answerId: newAnswer.id.toString(),
			authorId: 'author-id',
			content: 'Answer content',
			attachmentsIds: ['1', '5'],
		})

		expect(inMemoryAnswersRepository.items[0].content).toBe('Answer content')
		expect(inMemoryAnswersRepository.items[0].attachments.currentItems).toHaveLength(2)
		expect(inMemoryAnswersRepository.items[0].attachments.currentItems).toEqual([
			expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
			expect.objectContaining({ attachmentId: new UniqueEntityID('5') }),
		])
	})

	it('should not be able to edit a answer if it does not exist', async () => {
		const result = await sut.execute({
			answerId: 'non-existent-answer-id',
			authorId: 'author-id',
			content: 'Answer content',
			attachmentsIds: [],
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to edit a answer from other user', async () => {
		const newAnswer = makeAnswer({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('answer-id'))

		await inMemoryAnswersRepository.create(newAnswer)

		const result = await sut.execute({
			answerId: 'answer-id',
			authorId: 'other-author-id',
			content: 'Answer content',
			attachmentsIds: [],
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
