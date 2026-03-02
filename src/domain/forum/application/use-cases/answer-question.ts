import { type Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'
import { Answer } from '../../enterprise/entities/answer'
import { AnswerAttachment } from '../../enterprise/entities/answer-attachment'
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list'
import { AnswersRepository } from '../repositories/answers-repository'

interface AnswerQuestionUseCaseParams {
	questionId: string
	authorId: string
	content: string
	attachmentsIds: string[]
}

type AnswerQuestionUseCaseResponse = Either<null, { answer: Answer }>

@Injectable()
export class AnswerQuestionUseCase {
	constructor(private readonly answersRepository: AnswersRepository) {}

	async execute({
		questionId,
		authorId,
		content,
		attachmentsIds,
	}: AnswerQuestionUseCaseParams): Promise<AnswerQuestionUseCaseResponse> {
		const answer = Answer.create({
			questionId: new UniqueEntityID(questionId),
			authorId: new UniqueEntityID(authorId),
			content,
		})

		const answerAttachments = attachmentsIds.map((attachmentId) =>
			AnswerAttachment.create({
				answerId: answer.id,
				attachmentId: new UniqueEntityID(attachmentId),
			}),
		)

		answer.attachments = new AnswerAttachmentList(answerAttachments)

		await this.answersRepository.create(answer)

		return right({ answer })
	}
}
