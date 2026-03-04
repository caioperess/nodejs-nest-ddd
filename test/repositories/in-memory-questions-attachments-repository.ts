import type { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import type { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'

export class InMemoryQuestionsAttachmentsRepository implements QuestionAttachmentsRepository {
	public items: QuestionAttachment[] = []

	async createMany(questionAttachments: QuestionAttachment[]): Promise<void> {
		this.items.push(...questionAttachments)
	}

	async deleteMany(questionAttachments: QuestionAttachment[]): Promise<void> {
		this.items = this.items.filter((item) => !questionAttachments.some((attachment) => attachment.equals(item)))
	}

	async findManyByQuestionId(questionId: string): Promise<QuestionAttachment[]> {
		return this.items.filter((item) => item.questionId.toString() === questionId)
	}

	async deleteManyByQuestionId(questionId: string): Promise<void> {
		this.items = this.items.filter((item) => item.questionId.toString() !== questionId)
	}
}
