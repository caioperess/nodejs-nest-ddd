import { DomainEvents } from '@/core/events/domain-events'
import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'
import type { Answer } from '@/domain/forum/enterprise/entities/answer'
import type { InMemoryAnswersAttachmentsRepository } from './in-memory-answer-attachments-repository'

export class InMemoryAnswersRepository implements AnswersRepository {
	public items: Answer[] = []

	constructor(private readonly answerAttachmentsRepository?: InMemoryAnswersAttachmentsRepository) {}

	async create(answer: Answer): Promise<void> {
		this.items.push(answer)
		this.answerAttachmentsRepository?.createMany(answer.attachments.getItems())

		DomainEvents.dispatchEventsForAggregate(answer.id)
	}

	async save(answer: Answer): Promise<void> {
		const index = this.items.indexOf(answer)
		this.items[index] = answer

		this.answerAttachmentsRepository?.createMany(answer.attachments.getNewItems())
		this.answerAttachmentsRepository?.deleteMany(answer.attachments.getRemovedItems())

		DomainEvents.dispatchEventsForAggregate(answer.id)
	}

	async delete(answer: Answer): Promise<void> {
		const index = this.items.indexOf(answer)
		this.items.splice(index, 1)

		await this.answerAttachmentsRepository?.deleteManyByAnswerId(answer.id.toString())
	}

	async findById(id: string): Promise<Answer | null> {
		return this.items.find((item) => item.id.toString() === id) || null
	}

	async findManyByQuestionId(questionId: string, { page }: PaginationParams): Promise<Answer[]> {
		return this.items.filter((item) => item.questionId.toString() === questionId).slice((page - 1) * 20, page * 20)
	}
}
