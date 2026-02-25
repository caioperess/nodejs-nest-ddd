import { makeAnswer } from '@test/factories/make-answer'
import { InMemoryAnswerCommentsRepository } from '@test/repositories/in-memory-answer-comments-repository'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { CommentOnAnswerUseCase } from './comment-on-answer'

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let sut: CommentOnAnswerUseCase

describe('CommentOnAnswerUseCase', () => {
	beforeEach(() => {
		inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()
		inMemoryAnswersRepository = new InMemoryAnswersRepository()

		sut = new CommentOnAnswerUseCase(inMemoryAnswersRepository, inMemoryAnswerCommentsRepository)
	})

	it('should be able to comment on a answer', async () => {
		const answer = makeAnswer({}, new UniqueEntityID('answer-1'))

		await inMemoryAnswersRepository.create(answer)

		const result = await sut.execute({
			authorId: '1',
			answerId: answer.id.toString(),
			content: 'Answer content',
		})

		expect(result.isRight()).toBe(true)
		expect(result.value).toMatchObject({
			answerComment: expect.objectContaining({
				content: 'Answer content',
				answerId: answer.id,
			}),
		})
	})

	it('should not be able to comment on a non existing answer', async () => {
		const result = await sut.execute({
			answerId: '1',
			authorId: '1',
			content: 'Answer content',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
