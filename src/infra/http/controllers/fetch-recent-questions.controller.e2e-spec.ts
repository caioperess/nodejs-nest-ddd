import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('FetchRecentQuestions (E2E)', () => {
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

	test('[GET] /questions', async () => {
		const user = await prisma.user.create({
			data: {
				name: 'John Doe',
				email: 'john.doe@example.com',
				password: '123456',
			},
		})

		const accessToken = jwt.sign({ sub: user.id })

		await prisma.question.createMany({
			data: [
				{
					title: 'New question',
					slug: 'new-question',
					content: 'Content of the question',
					authorId: user.id,
				},
				{
					title: 'New question 2',
					slug: 'new-question-2',
					content: 'Content of the question 2',
					authorId: user.id,
				},
			],
		})

		const response = await request(app.getHttpServer())
			.get('/questions')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				page: 1,
			})

		expect(response.statusCode).toBe(200)
		expect(response.body.questions).toHaveLength(2)
		expect(response.body).toEqual({
			questions: [
				expect.objectContaining({ title: 'New question' }),
				expect.objectContaining({ title: 'New question 2' }),
			],
		})
	})
})
