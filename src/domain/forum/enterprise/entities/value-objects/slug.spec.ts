import { Slug } from './slug'

test('it should create a slug from text', () => {
	const slug = Slug.createFromText('An example of slug')
	expect(slug.value).toEqual('an-example-of-slug')
})
