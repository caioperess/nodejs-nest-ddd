import { AggregateRoot } from '@/core/entities/aggregate-root'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'
import { QuestionBestAnswerChosenEvent } from '../events/question-best-answer-chosen-event'
import { QuestionAttachmentList } from './question-attachment-list'
import { Slug } from './value-objects/slug'

export interface QuestionProps {
	authorId: UniqueEntityID
	bestAnswerId?: UniqueEntityID | null
	title: string
	content: string
	slug: Slug
	attachments: QuestionAttachmentList
	createdAt: Date
	updatedAt?: Date | null
}

export class Question extends AggregateRoot<QuestionProps> {
	get title() {
		return this.props.title
	}

	get content() {
		return this.props.content
	}

	get authorId() {
		return this.props.authorId
	}

	get bestAnswerId() {
		return this.props.bestAnswerId
	}

	get slug() {
		return this.props.slug
	}

	get attachments() {
		return this.props.attachments
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	get isNew(): boolean {
		return this.createdAt === this.updatedAt
	}

	set content(content: string) {
		this.props.content = content
		this.touch()
	}

	set title(title: string) {
		this.props.title = title
		this.props.slug = Slug.createFromText(title)
		this.touch()
	}

	set attachments(attachments: QuestionAttachmentList) {
		this.props.attachments = attachments
		this.touch()
	}

	set bestAnswerId(bestAnswerId: UniqueEntityID | undefined | null) {
		if (!!bestAnswerId && !this.props.bestAnswerId?.equals(bestAnswerId)) {
			this.addDomainEvent(new QuestionBestAnswerChosenEvent(this, bestAnswerId))
		}

		this.props.bestAnswerId = bestAnswerId
		this.touch()
	}

	private touch() {
		this.props.updatedAt = new Date()
	}

	static create(props: Optional<QuestionProps, 'createdAt' | 'slug' | 'attachments'>, id?: UniqueEntityID): Question {
		const question = new Question(
			{
				...props,
				slug: props.slug ?? Slug.createFromText(props.title),
				attachments: props.attachments ?? new QuestionAttachmentList(),
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return question
	}
}
