import { type Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { CommentWithAuthor } from '../../enterprise/entities/value-objects/comment-with-author'
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'

export interface FetchAnswerCommentsParams {
	answerId: string
	page: number
}

type FetchAnswerCommentsUseCaseResponse = Either<null, { comments: CommentWithAuthor[] }>

@Injectable()
export class FetchAnswerCommentsUseCase {
	constructor(private readonly commentsRepository: AnswerCommentsRepository) {}

	async execute({ answerId, page }: FetchAnswerCommentsParams): Promise<FetchAnswerCommentsUseCaseResponse> {
		const comments = await this.commentsRepository.findManyByAnswerIdWithAuthor(answerId, {
			page,
		})

		return right({ comments })
	}
}
