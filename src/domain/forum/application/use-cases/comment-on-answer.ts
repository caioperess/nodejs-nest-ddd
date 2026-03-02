import { type Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { AnswerComment } from '../../enterprise/entities/answer-comment'
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'
import { AnswersRepository } from '../repositories/answers-repository'

interface CommentOnAnswerUseCaseParams {
	answerId: string
	authorId: string
	content: string
}

type CommentOnAnswerUseCaseResponse = Either<ResourceNotFoundError, { answerComment: AnswerComment }>

@Injectable()
export class CommentOnAnswerUseCase {
	constructor(
		private readonly answersRepository: AnswersRepository,
		private readonly answerCommentsRepository: AnswerCommentsRepository,
	) {}

	async execute({
		answerId,
		authorId,
		content,
	}: CommentOnAnswerUseCaseParams): Promise<CommentOnAnswerUseCaseResponse> {
		const answer = await this.answersRepository.findById(answerId)

		if (!answer) {
			return left(new ResourceNotFoundError())
		}

		const answerComment = AnswerComment.create({
			answerId: answer.id,
			authorId: new UniqueEntityID(authorId),
			content,
		})

		this.answerCommentsRepository.create(answerComment)

		return right({ answerComment })
	}
}
