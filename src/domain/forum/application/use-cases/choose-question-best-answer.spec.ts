import { makeAnswer } from '@test/factories/make-answer'
import { makeQuestion } from '@test/factories/make-question'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository'
import { InMemoryQuestionsAttachmentsRepository } from '@test/repositories/in-memory-questions-attachments-repository'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ChooseQuestionBestAnswerUseCase } from './choose-question-best-answer'

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionsAttachmentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let sut: ChooseQuestionBestAnswerUseCase

describe('Choose Question Best Answer', () => {
	beforeEach(() => {
		inMemoryQuestionAttachmentsRepository = new InMemoryQuestionsAttachmentsRepository()
		inMemoryAnswersRepository = new InMemoryAnswersRepository()
		inMemoryQuestionsRepository = new InMemoryQuestionsRepository(inMemoryQuestionAttachmentsRepository)
		sut = new ChooseQuestionBestAnswerUseCase(inMemoryQuestionsRepository, inMemoryAnswersRepository)
	})

	it('should be able to choose a question best answer', async () => {
		const newQuestion = makeQuestion({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('question-id'))

		const newAnswer = makeAnswer(
			{
				questionId: newQuestion.id,
				authorId: new UniqueEntityID('answer-author-id'),
			},
			new UniqueEntityID('answer-id'),
		)

		await inMemoryAnswersRepository.create(newAnswer)
		await inMemoryQuestionsRepository.create(newQuestion)

		await sut.execute({
			answerId: newAnswer.id.toString(),
			authorId: newQuestion.authorId.toString(),
		})

		expect(inMemoryQuestionsRepository.items[0].bestAnswerId).toEqual(newAnswer.id)
	})

	it('should not be able to choose a question best answer if answer does not exist', async () => {
		const result = await sut.execute({
			answerId: 'non-existent-answer-id',
			authorId: 'author-id',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to choose a question best answer if question does not exist', async () => {
		const answer = makeAnswer({}, new UniqueEntityID('answer-id'))

		await inMemoryAnswersRepository.create(answer)

		const result = await sut.execute({
			answerId: answer.id.toString(),
			authorId: 'author-id',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to choose a question best answer from other user', async () => {
		const newQuestion = makeQuestion({ authorId: new UniqueEntityID('author-id') }, new UniqueEntityID('question-id'))

		const answer = makeAnswer({ questionId: newQuestion.id }, new UniqueEntityID('answer-id'))

		await inMemoryAnswersRepository.create(answer)
		await inMemoryQuestionsRepository.create(newQuestion)

		const result = await sut.execute({
			answerId: answer.id.toString(),
			authorId: 'other-author-id',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
