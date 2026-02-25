import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { DomainEvent } from '@/core/events/domain-event'
import type { Answer } from '../entities/answer'

export class AnswerCreatedEvent implements DomainEvent {
	public occurredAt: Date
	public answer: Answer

	constructor(answer: Answer) {
		this.occurredAt = new Date()
		this.answer = answer
	}

	public getAggregateId(): UniqueEntityID {
		return this.answer.id
	}
}
