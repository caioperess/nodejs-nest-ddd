import { FakeHasher } from '@test/crypotgraphy/fake-hasher'
import { InMemoryStudentsRepository } from '@test/repositories/in-memory-students-repository'
import { StudentAlreadyExistsError } from './errors/student-already-exists-error'
import { RegisterStudentUseCase } from './register-student'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let sut: RegisterStudentUseCase
let hasher: FakeHasher

describe('RegisterStudentUseCase', () => {
	beforeEach(() => {
		inMemoryStudentsRepository = new InMemoryStudentsRepository()
		hasher = new FakeHasher()
		sut = new RegisterStudentUseCase(inMemoryStudentsRepository, hasher)
	})

	it('should be able to create a student', async () => {
		const result = await sut.execute({
			name: 'John Doe',
			email: 'johndoe@example.com',
			password: '123456',
		})

		expect(result.isRight()).toBe(true)
		expect(result.value).toEqual({
			student: inMemoryStudentsRepository.items[0],
		})
	})

	it('should be able to hash the student password upon registration', async () => {
		const password = '123456'
		const hashedPassword = await hasher.hash(password)

		const result = await sut.execute({
			name: 'John Doe',
			email: 'johndoe@example.com',
			password,
		})

		expect(result.isRight()).toBe(true)
		expect(inMemoryStudentsRepository.items[0].password).toEqual(hashedPassword)
	})

	it('should not be able to register a student with same email', async () => {
		await sut.execute({
			name: 'John Doe',
			email: 'johndoe@example.com',
			password: '123456',
		})

		const result = await sut.execute({
			name: 'John Doe2',
			email: 'johndoe@example.com',
			password: '123456',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(StudentAlreadyExistsError)
	})
})
