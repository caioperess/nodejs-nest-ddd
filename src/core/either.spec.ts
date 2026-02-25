import { type Either, left, right } from './either'

function doSomething(x: boolean): Either<string, number> {
	return x ? right(1) : left('error')
}

test('success result', () => {
	const result = doSomething(true)

	expect(result.isRight()).toBe(true)
	expect(result.isLeft()).toBe(false)
	expect(result.value).toEqual(1)
})

test('error result', () => {
	const result = doSomething(false)

	expect(result.isLeft()).toBe(true)
	expect(result.isRight()).toBe(false)
	expect(result.value).toEqual('error')
})
