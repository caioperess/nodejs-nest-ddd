import { UniqueEntityID } from './unique-entity-id'

export abstract class Entity<T> {
	private readonly _id: UniqueEntityID
	protected props: T

	get id(): UniqueEntityID {
		return this._id
	}

	public equals(entity: Entity<unknown>) {
		if (entity === this) {
			return true
		}

		if (entity.id === this._id) {
			return true
		}

		return false
	}

	protected constructor(props: T, id?: UniqueEntityID) {
		this._id = id ?? new UniqueEntityID()
		this.props = props
	}
}
