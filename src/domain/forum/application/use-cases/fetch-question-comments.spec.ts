import { makeQuestionComment } from '@test/factories/make-question-comment'
import { makeStudent } from '@test/factories/make-student'
import { InMemoryQuestionCommentsRepository } from '@test/repositories/in-memory-question-comments-repository'
import { InMemoryStudentsRepository } from '@test/repositories/in-memory-students-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FetchQuestionCommentsUseCase } from './fetch-question-comments'

let studentsRepository: InMemoryStudentsRepository
let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let sut: FetchQuestionCommentsUseCase

describe('FetchQuestionComments', () => {
	beforeEach(() => {
		studentsRepository = new InMemoryStudentsRepository()
		inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(studentsRepository)
		sut = new FetchQuestionCommentsUseCase(inMemoryQuestionCommentsRepository)
	})

	it('should be able to fetch question comments with author', async () => {
		const author = makeStudent()

		await studentsRepository.create(author)

		for (let i = 0; i < 3; i++) {
			await inMemoryQuestionCommentsRepository.create(
				makeQuestionComment(
					{
						questionId: new UniqueEntityID('question-1'),
						authorId: author.id,
					},
					new UniqueEntityID(`comment-${i + 1}`),
				),
			)
		}

		const result = await sut.execute({
			page: 1,
			questionId: 'question-1',
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

	it('should be able to fetch paginated question comments', async () => {
		const author = makeStudent()

		await studentsRepository.create(author)

		for (let i = 1; i <= 22; i++) {
			await inMemoryQuestionCommentsRepository.create(
				makeQuestionComment({
					questionId: new UniqueEntityID('question-1'),
					authorId: author.id,
				}),
			)
		}

		const result = await sut.execute({
			page: 2,
			questionId: 'question-1',
		})

		expect(result.value?.comments).toHaveLength(2)
	})
})
