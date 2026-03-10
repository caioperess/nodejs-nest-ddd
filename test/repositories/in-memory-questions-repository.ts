import { DomainEvents } from '@/core/events/domain-events'
import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'
import type { Question } from '@/domain/forum/enterprise/entities/question'
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'
import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'
import { InMemoryQuestionsAttachmentsRepository } from './in-memory-questions-attachments-repository'
import { InMemoryStudentsRepository } from './in-memory-students-repository'

export class InMemoryQuestionsRepository implements QuestionsRepository {
	public items: Question[] = []

	constructor(
		private readonly questionAttachmentsRepository?: InMemoryQuestionsAttachmentsRepository,
		private readonly attachmentsRepository?: InMemoryAttachmentsRepository,
		private readonly studentsRepository?: InMemoryStudentsRepository,
	) {}

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

	async findBySlugWithDetails(slug: string): Promise<QuestionDetails | null> {
		const question = this.items.find((question) => question.slug.value === slug)

		if (!question) {
			return null
		}

		const author = this.studentsRepository?.items.find((student) => student.id.equals(question.authorId))

		if (!author) {
			throw new Error(`Author with ID ${question.authorId.toString()} not found`)
		}

		const questionAttachments = this.questionAttachmentsRepository?.items.filter((item) =>
			item.questionId.equals(question.id),
		)

		const attachments =
			this.attachmentsRepository?.items.filter((item) =>
				questionAttachments?.some((qa) => qa.attachmentId.equals(item.id)),
			) ?? []

		const hasQuestionAttachments = questionAttachments && questionAttachments.length > 0
		const hasAttachments = attachments && attachments.length > 0

		if (hasQuestionAttachments && !hasAttachments) {
			throw new Error(`No attachments created for the question with ID ${question.id.toString()}`)
		}

		return QuestionDetails.create({
			questionId: question.id,
			authorId: question.authorId,
			author: author.name,
			title: question.title,
			slug: question.slug,
			content: question.content,
			attachments: attachments,
			bestAnswerId: question.bestAnswerId,
			createdAt: question.createdAt,
			updatedAt: question.updatedAt,
		})
	}

	async findById(id: string): Promise<Question | null> {
		const question = this.items.find((question) => question.id.toString() === id)

		return question ?? null
	}

	async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
		return this.items.slice((page - 1) * 20, page * 20).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
	}
}
