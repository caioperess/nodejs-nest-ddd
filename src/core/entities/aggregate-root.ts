import type { DomainEvent } from '../events/domain-event'
import { DomainEvents } from '../events/domain-events'
import { Entity } from './entity'

export abstract class AggregateRoot<T> extends Entity<T> {
	private _domainEvents: DomainEvent[] = []

	get domainEvents(): DomainEvent[] {
		return this._domainEvents
	}

	protected addDomainEvent(domainEvent: DomainEvent) {
		this._domainEvents.push(domainEvent)
		DomainEvents.markAggregateForDispatch(this)
	}

	public clearEvents() {
		this._domainEvents = []
	}
}
