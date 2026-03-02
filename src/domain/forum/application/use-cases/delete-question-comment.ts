import { type Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { QuestionCommentsRepository } from '../repositories/question-comments-repository'

interface DeleteQuestionCommentUseCaseParams {
	questionCommentId: string
	authorId: string
}

type DeleteQuestionCommentUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, object>

@Injectable()
export class DeleteQuestionCommentUseCase {
	constructor(private readonly questionCommentsRepository: QuestionCommentsRepository) {}

	async execute({
		authorId,
		questionCommentId,
	}: DeleteQuestionCommentUseCaseParams): Promise<DeleteQuestionCommentUseCaseResponse> {
		const questionComment = await this.questionCommentsRepository.findById(questionCommentId)

		if (!questionComment) {
			return left(new ResourceNotFoundError())
		}

		if (questionComment.authorId.toString() !== authorId) {
			return left(new NotAllowedError())
		}

		await this.questionCommentsRepository.delete(questionComment)

		return right({})
	}
}
