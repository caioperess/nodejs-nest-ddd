import { Injectable } from '@nestjs/common'
import { type Either, right } from '@/core/either'
import { Question } from '../../enterprise/entities/question'
import { QuestionsRepository } from '../repositories/questions-repository'

export interface FetchRecentQuestionsParams {
	page: number
}

export type FetchRecentQuestionsUseCaseResponse = Either<null, { questions: Question[] }>

@Injectable()
export class FetchRecentQuestionsUseCase {
	constructor(private readonly questionsRepository: QuestionsRepository) {}

	async execute({ page }: FetchRecentQuestionsParams): Promise<FetchRecentQuestionsUseCaseResponse> {
		const questions = await this.questionsRepository.findManyRecent({ page })

		return right({
			questions,
		})
	}
}
