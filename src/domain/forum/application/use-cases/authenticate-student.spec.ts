import { FakeEncrypter } from '@test/crypotgraphy/fake-encrypter'
import { FakeHasher } from '@test/crypotgraphy/fake-hasher'
import { makeStudent } from '@test/factories/make-student'
import { InMemoryStudentsRepository } from '@test/repositories/in-memory-students-repository'
import { AuthenticateStudentUseCase } from './authenticate-student'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let sut: AuthenticateStudentUseCase
let hasher: FakeHasher
let encrypter: FakeEncrypter

describe('AuthenticateStudentUseCase', () => {
	beforeEach(() => {
		inMemoryStudentsRepository = new InMemoryStudentsRepository()
		hasher = new FakeHasher()
		encrypter = new FakeEncrypter()
		sut = new AuthenticateStudentUseCase(inMemoryStudentsRepository, hasher, encrypter)
	})

	it('should be able to authenticate a student', async () => {
		const student = makeStudent({
			email: 'johndoe@example.com',
			password: await hasher.hash('123456'),
		})

		await inMemoryStudentsRepository.create(student)

		const result = await sut.execute({
			email: student.email,
			password: '123456',
		})

		expect(result.isRight()).toBe(true)
		expect(result.value).toEqual({
			accessToken: expect.any(String),
		})
	})
})
