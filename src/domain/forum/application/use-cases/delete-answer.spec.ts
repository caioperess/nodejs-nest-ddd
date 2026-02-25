import { makeAnswer } from '@test/factories/make-answer'
import { makeAnswerAttachment } from '@test/factories/make-answer-attachment'
import { InMemoryAnswersAttachmentsRepository } from '@test/repositories/in-memory-answer-attachments-repository'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DeleteAnswerUseCase } from './delete-answer'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswersAttachmentsRepository
let sut: DeleteAnswerUseCase

describe('Delete Answer', () => {
	beforeEach(() => {
		inMemoryAnswerAttachmentsRepository = new InMemoryAnswersAttachmentsRepository()
		inMemoryAnswersRepository = new InMemoryAnswersRepository(inMemoryAnswerAttachmentsRepository)
		sut = new DeleteAnswerUseCase(inMemoryAnswersRepository)
	})

	it('should be able to delete an answer', async () => {
		const newAnswer = makeAnswer({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('answer-id'))

		await inMemoryAnswersRepository.create(newAnswer)

		inMemoryAnswerAttachmentsRepository.items.push(
			makeAnswerAttachment({ answerId: newAnswer.id, attachmentId: new UniqueEntityID('1') }),
			makeAnswerAttachment({ answerId: newAnswer.id, attachmentId: new UniqueEntityID('2') }),
		)

		await sut.execute({
			answerId: 'answer-id',
			authorId: 'author-id',
		})

		expect(inMemoryAnswersRepository.items).toHaveLength(0)
		expect(inMemoryAnswerAttachmentsRepository.items).toHaveLength(0)
	})

	it('should not be able to delete an answer if it does not exist', async () => {
		const result = await sut.execute({
			answerId: 'non-existent-answer-id',
			authorId: 'author-id',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to delete an answer from other user', async () => {
		const newAnswer = makeAnswer({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('answer-id'))

		await inMemoryAnswersRepository.create(newAnswer)

		const result = await sut.execute({
			answerId: 'answer-id',
			authorId: 'other-author-id',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
