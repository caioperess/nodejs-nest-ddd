import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('CreateQuestion (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let jwt: JwtService

	beforeAll(async () => {
		const { AppModule } = await import('@/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)

		await app.init()
	})

	test('[POST] /questions', async () => {
		const user = await prisma.user.create({
			data: {
				name: 'John Doe',
				email: 'john.doe@example.com',
				password: '123456',
			},
		})

		const accessToken = jwt.sign({ sub: user.id })

		const response = await request(app.getHttpServer())
			.post('/questions')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				title: 'New question',
				content: 'Content of the question',
			})

		expect(response.statusCode).toBe(201)

		const questionOnDB = await prisma.question.findFirst({
			where: {
				title: 'New question',
			},
		})

		expect(questionOnDB).toBeTruthy()
	})
})
