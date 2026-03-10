import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { QuestionDetails } from '../../enterprise/entities/value-objects/question-details'
import { QuestionsRepository } from '../repositories/questions-repository'

interface GetQuestionBySlugUseCaseParams {
	slug: string
}

export type GetQuestionBySlugUseCaseResponse = Either<ResourceNotFoundError, { question: QuestionDetails }>

@Injectable()
export class GetQuestionBySlugUseCase {
	constructor(private readonly questionsRepository: QuestionsRepository) {}

	async execute({ slug }: GetQuestionBySlugUseCaseParams): Promise<GetQuestionBySlugUseCaseResponse> {
		const question = await this.questionsRepository.findBySlugWithDetails(slug)

		if (!question) {
			return left(new ResourceNotFoundError())
		}

		return right({
			question,
		})
	}
}
