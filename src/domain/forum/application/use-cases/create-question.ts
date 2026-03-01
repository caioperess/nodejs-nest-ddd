import { Injectable } from '@nestjs/common'
import { type Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Question } from '../../enterprise/entities/question'
import { QuestionAttachment } from '../../enterprise/entities/question-attachment'
import { QuestionAttachmentList } from '../../enterprise/entities/question-attachment-list'
import { QuestionsRepository } from '../repositories/questions-repository'

interface CreateQuestionUseCaseParams {
	authorId: string
	title: string
	content: string
	attachmentsIds: string[]
}

type CreateQuestionUseCaseResponse = Either<null, { question: Question }>

@Injectable()
export class CreateQuestionUseCase {
	constructor(private readonly questionsRepository: QuestionsRepository) {}

	async execute({
		authorId,
		title,
		content,
		attachmentsIds,
	}: CreateQuestionUseCaseParams): Promise<CreateQuestionUseCaseResponse> {
		const question = Question.create({
			authorId: new UniqueEntityID(authorId),
			title,
			content,
		})

		const questionAttachments = attachmentsIds.map((attachmentId) =>
			QuestionAttachment.create({
				questionId: question.id,
				attachmentId: new UniqueEntityID(attachmentId),
			}),
		)

		question.attachments = new QuestionAttachmentList(questionAttachments)

		await this.questionsRepository.create(question)

		return right({ question })
	}
}
