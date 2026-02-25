import { type Either, right } from '@/core/either'
import type { Answer } from '../../enterprise/entities/answer'
import type { AnswersRepository } from '../repositories/answers-repository'

export interface FetchQuestionAnswersParams {
	questionId: string
	page: number
}

type FetchQuestionAnswersUseCaseResponse = Either<null, { answers: Answer[] }>

export class FetchQuestionAnswersUseCase {
	constructor(private readonly answersRepository: AnswersRepository) {}

	async execute({ questionId, page }: FetchQuestionAnswersParams): Promise<FetchQuestionAnswersUseCaseResponse> {
		const answers = await this.answersRepository.findManyByQuestionId(questionId, {
			page,
		})

		return right({ answers })
	}
}
