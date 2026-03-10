import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { QuestionAttachment } from '../../enterprise/entities/question-attachment'
import { QuestionAttachmentList } from '../../enterprise/entities/question-attachment-list'
import { QuestionAttachmentsRepository } from '../repositories/question-attachments-repository'
import { QuestionsRepository } from '../repositories/questions-repository'

export interface EditQuestionUseCaseRequest {
	questionId: string
	authorId: string
	title: string
	content: string
	attachmentsIds: string[]
}

type EditQuestionUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, object>

@Injectable()
export class EditQuestionUseCase {
	constructor(
		private readonly questionsRepository: QuestionsRepository,
		private readonly questionAttachmentsRepository: QuestionAttachmentsRepository,
	) {}

	async execute({
		questionId,
		authorId,
		title,
		content,
		attachmentsIds,
	}: EditQuestionUseCaseRequest): Promise<EditQuestionUseCaseResponse> {
		const question = await this.questionsRepository.findById(questionId)

		if (!question) {
			return left(new ResourceNotFoundError())
		}

		if (question.authorId.toString() !== authorId) {
			return left(new NotAllowedError())
		}

		const currentQuestionAttachments = await this.questionAttachmentsRepository.findManyByQuestionId(questionId)

		const questionAttachmentList = new QuestionAttachmentList(currentQuestionAttachments)

		const questionAttachments = attachmentsIds.map((attachmentId) =>
			QuestionAttachment.create({
				questionId: question.id,
				attachmentId: new UniqueEntityID(attachmentId),
			}),
		)

		questionAttachmentList.update(questionAttachments)

		question.title = title
		question.content = content
		question.attachments = questionAttachmentList

		await this.questionsRepository.save(question)

		return right({})
	}
}
