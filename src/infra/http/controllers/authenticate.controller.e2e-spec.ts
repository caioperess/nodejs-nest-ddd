import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'
import { CryptographyModule } from '@/infra/cryptography/cryptography.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'

describe('Authenticate (E2E)', () => {
	let app: INestApplication
	let studentFactory: StudentFactory
	let hasher: HashGenerator

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule, CryptographyModule],
			providers: [StudentFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		studentFactory = moduleRef.get(StudentFactory)
		hasher = moduleRef.get(HashGenerator)

		await app.init()
	})

	test('[POST] /sessions', async () => {
		await studentFactory.makePrismaStudent({
			email: 'john.doe@example.com',
			password: await hasher.hash('123456'),
		})

		const response = await request(app.getHttpServer()).post('/sessions').send({
			email: 'john.doe@example.com',
			password: '123456',
		})

		expect(response.statusCode).toBe(200)
		expect(response.body).toHaveProperty('access_token')
	})
})
