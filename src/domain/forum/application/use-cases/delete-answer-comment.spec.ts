import { makeAnswerComment } from '@test/factories/make-answer-comment'
import { InMemoryAnswerCommentsRepository } from '@test/repositories/in-memory-answer-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DeleteAnswerCommentUseCase } from './delete-answer-comment'

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let sut: DeleteAnswerCommentUseCase

describe('DeleteAnswerCommentUseCase', () => {
	beforeEach(() => {
		inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()

		sut = new DeleteAnswerCommentUseCase(inMemoryAnswerCommentsRepository)
	})

	it('should be able to delete a answer comment', async () => {
		const answerComment = makeAnswerComment({}, new UniqueEntityID('answer-comment-1'))

		await inMemoryAnswerCommentsRepository.create(answerComment)

		const result = await sut.execute({
			authorId: answerComment.authorId.toString(),
			answerCommentId: answerComment.id.toString(),
		})

		expect(result.isRight()).toBe(true)
		expect(inMemoryAnswerCommentsRepository.items).toHaveLength(0)
	})

	it('should not be able to delete a non existing answer comment', async () => {
		const result = await sut.execute({
			answerCommentId: '1',
			authorId: '1',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to delete a answer comment if the user is not the author', async () => {
		const answerComment = makeAnswerComment(
			{ authorId: new UniqueEntityID('author-1') },
			new UniqueEntityID('answer-comment-1'),
		)

		await inMemoryAnswerCommentsRepository.create(answerComment)

		const result = await sut.execute({
			answerCommentId: answerComment.id.toString(),
			authorId: '2',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
