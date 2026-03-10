import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { AnswersRepository } from '../repositories/answers-repository'

interface DeleteAnswerUseCaseParams {
	answerId: string
	authorId: string
}

type DeleteAnswerUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, object>

@Injectable()
export class DeleteAnswerUseCase {
	constructor(private readonly answersRepository: AnswersRepository) {}

	async execute({ answerId, authorId }: DeleteAnswerUseCaseParams): Promise<DeleteAnswerUseCaseResponse> {
		const answer = await this.answersRepository.findById(answerId)

		if (!answer) {
			return left(new ResourceNotFoundError())
		}

		if (answer.authorId.toString() !== authorId) {
			return left(new NotAllowedError())
		}

		await this.answersRepository.delete(answer)

		return right({})
	}
}
