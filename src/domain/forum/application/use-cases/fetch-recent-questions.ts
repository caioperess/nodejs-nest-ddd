import { type Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import type { Question } from '../../enterprise/entities/question'
import type { QuestionsRepository } from '../repositories/questions-repository'

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
