import { type Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { QuestionComment } from '../../enterprise/entities/question-comment'
import type { QuestionCommentsRepository } from '../repositories/question-comments-repository'
import type { QuestionsRepository } from '../repositories/questions-repository'

interface CommentOnQuestionUseCaseParams {
	questionId: string
	authorId: string
	content: string
}

type CommentOnQuestionUseCaseResponse = Either<ResourceNotFoundError, { questionComment: QuestionComment }>

export class CommentOnQuestionUseCase {
	constructor(
		private readonly questionsRepository: QuestionsRepository,
		private readonly questionCommentsRepository: QuestionCommentsRepository,
	) {}

	async execute({
		questionId,
		authorId,
		content,
	}: CommentOnQuestionUseCaseParams): Promise<CommentOnQuestionUseCaseResponse> {
		const question = await this.questionsRepository.findById(questionId)

		if (!question) {
			return left(new ResourceNotFoundError())
		}

		const questionComment = QuestionComment.create({
			questionId: question.id,
			authorId: new UniqueEntityID(authorId),
			content,
		})

		this.questionCommentsRepository.create(questionComment)

		return right({ questionComment })
	}
}
