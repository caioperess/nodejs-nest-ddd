import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAnswerComment } from '@test/factories/make-answer-comment'
import { makeStudent } from '@test/factories/make-student'
import { InMemoryAnswerCommentsRepository } from '@test/repositories/in-memory-answer-comments-repository'
import { InMemoryStudentsRepository } from '@test/repositories/in-memory-students-repository'
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let sut: FetchAnswerCommentsUseCase

describe('FetchAnswerComments', () => {
	beforeEach(() => {
		inMemoryStudentsRepository = new InMemoryStudentsRepository()
		inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(inMemoryStudentsRepository)
		sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository)
	})

	it('should be able to fetch answer comments with author', async () => {
		const author = makeStudent()

		await inMemoryStudentsRepository.create(author)

		for (let i = 0; i < 3; i++) {
			await inMemoryAnswerCommentsRepository.create(
				makeAnswerComment(
					{
						answerId: new UniqueEntityID('answer-1'),
						authorId: author.id,
					},
					new UniqueEntityID(`comment-${i + 1}`),
				),
			)
		}

		const result = await sut.execute({
			page: 1,
			answerId: 'answer-1',
		})

		expect(result.value?.comments).toHaveLength(3)
		expect(result.value?.comments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					author: author.name,
					commentId: new UniqueEntityID('comment-1'),
				}),
				expect.objectContaining({
					author: author.name,
					commentId: new UniqueEntityID('comment-2'),
				}),
				expect.objectContaining({
					author: author.name,
					commentId: new UniqueEntityID('comment-3'),
				}),
			]),
		)
	})

	it('should be able to fetch paginated answer comments', async () => {
		const author = makeStudent()

		await inMemoryStudentsRepository.create(author)

		for (let i = 1; i <= 22; i++) {
			await inMemoryAnswerCommentsRepository.create(
				makeAnswerComment({
					answerId: new UniqueEntityID('answer-1'),
					authorId: author.id,
				}),
			)
		}

		const result = await sut.execute({
			page: 2,
			answerId: 'answer-1',
		})

		expect(result.value?.comments).toHaveLength(2)
		expect(result.value?.comments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					author: author.name,
				}),
				expect.objectContaining({
					author: author.name,
				}),
			]),
		)
	})
})
