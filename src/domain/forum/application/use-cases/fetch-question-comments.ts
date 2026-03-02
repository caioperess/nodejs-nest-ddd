import { type Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { QuestionComment } from '../../enterprise/entities/question-comment'
import { QuestionCommentsRepository } from '../repositories/question-comments-repository'

export interface FetchQuestionCommentsParams {
	questionId: string
	page: number
}

type FetchQuestionCommentsUseCaseResponse = Either<null, { comments: QuestionComment[] }>

@Injectable()
export class FetchQuestionCommentsUseCase {
	constructor(private readonly commentsRepository: QuestionCommentsRepository) {}

	async execute({ questionId, page }: FetchQuestionCommentsParams): Promise<FetchQuestionCommentsUseCaseResponse> {
		const comments = await this.commentsRepository.findManyByQuestionId(questionId, {
			page,
		})

		return right({
			comments,
		})
	}
}
