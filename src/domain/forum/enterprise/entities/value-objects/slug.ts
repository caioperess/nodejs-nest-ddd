export class Slug {
	public value: string

	private constructor(value: string) {
		this.value = value
	}

	static create(value: string) {
		return new Slug(value)
	}

	/**
	 * Receives a text and returns a slug
	 *
	 * Example: "An example of slug" -> "an-example-of-slug"
	 *
	 * @param text
	 */
	static createFromText(text: string) {
		const slugText = text
			.normalize('NFKD')
			.toLowerCase()
			.trim()
			.replaceAll(/\s+/g, '-')
			.replaceAll(/[^\w-]+/g, '')
			.replaceAll('_', '-')
			.replaceAll(/--+/g, '-')
			.replaceAll(/-$/g, '')

		return new Slug(slugText)
	}
}
