import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { AnswerAttachment } from '../../enterprise/entities/answer-attachment'
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list'
import { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository'
import { AnswersRepository } from '../repositories/answers-repository'

export interface EditAnswerUseCaseRequest {
	answerId: string
	authorId: string
	content: string
	attachmentsIds: string[]
}

type EditAnswerUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, object>

@Injectable()
export class EditAnswerUseCase {
	constructor(
		private readonly answersRepository: AnswersRepository,
		private readonly answerAttachmentsRepository: AnswerAttachmentsRepository,
	) {}

	async execute({
		answerId,
		authorId,
		content,
		attachmentsIds,
	}: EditAnswerUseCaseRequest): Promise<EditAnswerUseCaseResponse> {
		const answer = await this.answersRepository.findById(answerId)

		if (!answer) {
			return left(new ResourceNotFoundError())
		}

		if (answer.authorId.toString() !== authorId) {
			return left(new NotAllowedError())
		}

		const currentAnswerAttachments = await this.answerAttachmentsRepository.findManyByAnswerId(answerId)

		const answerAttachmentsList = new AnswerAttachmentList(currentAnswerAttachments)

		const answerAttachments = attachmentsIds.map((attachmentId) =>
			AnswerAttachment.create({
				answerId: answer.id,
				attachmentId: new UniqueEntityID(attachmentId),
			}),
		)

		answerAttachmentsList.update(answerAttachments)

		answer.content = content
		answer.attachments = answerAttachmentsList

		await this.answersRepository.save(answer)

		return right({})
	}
}
