import { type Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'

interface DeleteAnswerCommentUseCaseParams {
	answerCommentId: string
	authorId: string
}

type DeleteAnswerCommentUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, object>

@Injectable()
export class DeleteAnswerCommentUseCase {
	constructor(private readonly answerCommentsRepository: AnswerCommentsRepository) {}

	async execute({
		authorId,
		answerCommentId,
	}: DeleteAnswerCommentUseCaseParams): Promise<DeleteAnswerCommentUseCaseResponse> {
		const answerComment = await this.answerCommentsRepository.findById(answerCommentId)

		if (!answerComment) {
			return left(new ResourceNotFoundError())
		}

		if (answerComment.authorId.toString() !== authorId) {
			return left(new NotAllowedError())
		}

		await this.answerCommentsRepository.delete(answerComment)

		return right({})
	}
}
