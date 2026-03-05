export abstract class ValueObject<T> {
	protected props: T

	public equals(vo: ValueObject<unknown>) {
		if (vo === null || vo === undefined) {
			return false
		}

		if (vo.props === undefined) {
			return false
		}

		return JSON.stringify(this.props) === JSON.stringify(vo.props)
	}

	protected constructor(props: T) {
		this.props = props
	}
}
