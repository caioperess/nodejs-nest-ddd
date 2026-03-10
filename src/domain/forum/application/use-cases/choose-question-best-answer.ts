import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Question } from '../../enterprise/entities/question'
import { AnswersRepository } from '../repositories/answers-repository'
import { QuestionsRepository } from '../repositories/questions-repository'

interface ChooseQuestionBestAnswerUseCaseRequest {
	answerId: string
	authorId: string
}

type ChooseQuestionBestAnswerUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, { question: Question }>

@Injectable()
export class ChooseQuestionBestAnswerUseCase {
	constructor(
		private readonly questionsRepository: QuestionsRepository,
		private readonly answersRepository: AnswersRepository,
	) {}

	async execute({
		answerId,
		authorId,
	}: ChooseQuestionBestAnswerUseCaseRequest): Promise<ChooseQuestionBestAnswerUseCaseResponse> {
		const answer = await this.answersRepository.findById(answerId)

		if (!answer) {
			return left(new ResourceNotFoundError())
		}

		const question = await this.questionsRepository.findById(answer.questionId.toString())

		if (!question) {
			return left(new ResourceNotFoundError())
		}

		if (question.authorId.toString() !== authorId) {
			return left(new NotAllowedError())
		}

		question.bestAnswerId = answer.id

		await this.questionsRepository.save(question)

		return right({ question })
	}
}
