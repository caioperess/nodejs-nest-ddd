import { Injectable } from '@nestjs/common'
import { type Either, right } from '@/core/either'
import { CommentWithAuthor } from '../../enterprise/entities/value-objects/comment-with-author'
import { QuestionCommentsRepository } from '../repositories/question-comments-repository'

export interface FetchQuestionCommentsParams {
	questionId: string
	page: number
}

type FetchQuestionCommentsUseCaseResponse = Either<null, { comments: CommentWithAuthor[] }>

@Injectable()
export class FetchQuestionCommentsUseCase {
	constructor(private readonly commentsRepository: QuestionCommentsRepository) {}

	async execute({ questionId, page }: FetchQuestionCommentsParams): Promise<FetchQuestionCommentsUseCaseResponse> {
		const comments = await this.commentsRepository.findManyByQuestionIdWithAuthor(questionId, {
			page,
		})

		return right({
			comments,
		})
	}
}
