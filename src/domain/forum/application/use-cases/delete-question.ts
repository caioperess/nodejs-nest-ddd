import { type Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { QuestionsRepository } from '../repositories/questions-repository'

interface DeleteQuestionUseCaseParams {
	questionId: string
	authorId: string
}

type DeleteQuestionUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, object>

@Injectable()
export class DeleteQuestionUseCase {
	constructor(private readonly questionsRepository: QuestionsRepository) {}

	async execute({ questionId, authorId }: DeleteQuestionUseCaseParams): Promise<DeleteQuestionUseCaseResponse> {
		const question = await this.questionsRepository.findById(questionId)

		if (!question) {
			return left(new ResourceNotFoundError())
		}

		if (question.authorId.toString() !== authorId) {
			return left(new NotAllowedError())
		}

		await this.questionsRepository.delete(question)

		return right({})
	}
}
