import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Upload Attachment (E2E)', () => {
	let app: INestApplication
	let studentFactory: StudentFactory
	let jwt: JwtService

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		studentFactory = moduleRef.get(StudentFactory)
		jwt = moduleRef.get(JwtService)

		await app.init()
	})

	test('[POST] /attachments', async () => {
		const user = await studentFactory.makePrismaStudent({
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: '123456',
		})

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const response = await request(app.getHttpServer())
			.post('/attachments')
			.set('Authorization', `Bearer ${accessToken}`)
			.attach('file', './test/e2e/gojo.png')

		expect(response.statusCode).toBe(201)
		expect(response.body).toEqual({
			attachmentId: expect.any(String),
		})
	})
})
