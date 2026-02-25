import { makeQuestion } from '@test/factories/make-question'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository'
import { expect } from 'node_modules/vitest/dist'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Slug } from '../../enterprise/entities/value-objects/slug'
import { GetQuestionBySlugUseCase } from './get-question-by-slug'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let sut: GetQuestionBySlugUseCase

describe('Get Question by Slug', () => {
	beforeEach(() => {
		inMemoryQuestionsRepository = new InMemoryQuestionsRepository()
		sut = new GetQuestionBySlugUseCase(inMemoryQuestionsRepository)
	})

	it('should be able to get a question by slug', async () => {
		const newQuestion = makeQuestion({
			slug: Slug.create('question-title'),
		})

		await inMemoryQuestionsRepository.create(newQuestion)

		const result = await sut.execute({
			slug: 'question-title',
		})

		expect(result.value).toMatchObject({
			question: expect.objectContaining({
				title: newQuestion.title,
			}),
		})
	})

	it('should not be able to get a question by slug if it does not exist', async () => {
		const result = await sut.execute({
			slug: 'non-existent-slug',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
