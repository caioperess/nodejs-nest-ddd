import { DomainEvents } from '@/core/events/domain-events'
import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import type { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'
import type { Question } from '@/domain/forum/enterprise/entities/question'

export class InMemoryQuestionsRepository implements QuestionsRepository {
	public items: Question[] = []

	constructor(private readonly questionAttachmentsRepository?: QuestionAttachmentsRepository) {}

	async create(question: Question): Promise<void> {
		this.items.push(question)
		this.questionAttachmentsRepository?.createMany(question.attachments.getItems())

		DomainEvents.dispatchEventsForAggregate(question.id)
	}

	async save(question: Question): Promise<void> {
		const index = this.items.indexOf(question)
		this.items[index] = question

		this.questionAttachmentsRepository?.createMany(question.attachments.getNewItems())
		this.questionAttachmentsRepository?.deleteMany(question.attachments.getRemovedItems())

		DomainEvents.dispatchEventsForAggregate(question.id)
	}

	async delete(question: Question): Promise<void> {
		const index = this.items.indexOf(question)
		this.items.splice(index, 1)

		await this.questionAttachmentsRepository?.deleteManyByQuestionId(question.id.toString())
	}

	async findBySlug(slug: string): Promise<Question | null> {
		const question = this.items.find((question) => question.slug.value === slug)

		return question ?? null
	}

	async findById(id: string): Promise<Question | null> {
		const question = this.items.find((question) => question.id.toString() === id)

		return question ?? null
	}

	async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
		return this.items.slice((page - 1) * 20, page * 20).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
	}
}
