import { QuestionAttachment } from '../../enterprise/entities/question-attachment'

export abstract class QuestionAttachmentsRepository {
	abstract createMany(questionAttachments: QuestionAttachment[]): Promise<void>
	abstract deleteMany(questionAttachments: QuestionAttachment[]): Promise<void>
	abstract findManyByQuestionId(questionId: string): Promise<QuestionAttachment[]>
	abstract deleteManyByQuestionId(questionId: string): Promise<void>
}
