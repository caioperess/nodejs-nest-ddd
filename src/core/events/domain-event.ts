import type { UniqueEntityID } from '../entities/unique-entity-id'

export interface DomainEvent {
	occurredAt: Date
	getAggregateId(): UniqueEntityID
}
