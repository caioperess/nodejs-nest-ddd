import { type Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { AnswerComment } from '../../enterprise/entities/answer-comment'
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'

export interface FetchAnswerCommentsParams {
	answerId: string
	page: number
}

type FetchAnswerCommentsUseCaseResponse = Either<null, { comments: AnswerComment[] }>

@Injectable()
export class FetchAnswerCommentsUseCase {
	constructor(private readonly commentsRepository: AnswerCommentsRepository) {}

	async execute({ answerId, page }: FetchAnswerCommentsParams): Promise<FetchAnswerCommentsUseCaseResponse> {
		const comments = await this.commentsRepository.findManyByAnswerId(answerId, {
			page,
		})

		return right({ comments })
	}
}
