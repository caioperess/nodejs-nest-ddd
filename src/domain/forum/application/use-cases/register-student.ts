import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { Student } from '../../enterprise/entities/student'
import { HashGenerator } from '../cryptography/hash-generator'
import { StudentsRepository } from '../repositories/students-repository'
import { StudentAlreadyExistsError } from './errors/student-already-exists-error'

interface RegisterStudentUseCaseParams {
	name: string
	email: string
	password: string
}

type RegisterStudentUseCaseResponse = Either<StudentAlreadyExistsError, { student: Student }>

@Injectable()
export class RegisterStudentUseCase {
	constructor(
		private readonly studentsRepository: StudentsRepository,
		private readonly hashGenerator: HashGenerator,
	) {}

	async execute({ name, email, password }: RegisterStudentUseCaseParams): Promise<RegisterStudentUseCaseResponse> {
		const userAlreadyExists = await this.studentsRepository.findByEmail(email)

		if (userAlreadyExists) {
			return left(new StudentAlreadyExistsError(email))
		}

		const passwordHash = await this.hashGenerator.hash(password)

		const student = Student.create({
			name,
			email,
			password: passwordHash,
		})

		await this.studentsRepository.create(student)

		return right({ student })
	}
}
