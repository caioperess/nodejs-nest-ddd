import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { QuestionFactory } from '@test/factories/make-question'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'
import { DatabaseModule } from '@/infra/database/database.module'

describe('FetchRecentQuestions (E2E)', () => {
	let app: INestApplication
	let studentFactory: StudentFactory
	let questionFactory: QuestionFactory
	let jwt: JwtService

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, QuestionFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)
		jwt = moduleRef.get(JwtService)

		await app.init()
	})

	test('[GET] /questions', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		await Promise.all([
			questionFactory.makePrismaQuestion({
				title: 'New question',
				authorId: user.id,
			}),
			questionFactory.makePrismaQuestion({
				title: 'New question 2',
				authorId: user.id,
			}),
		])

		const response = await request(app.getHttpServer())
			.get('/questions')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				page: 1,
			})

		expect(response.statusCode).toBe(200)
		expect(response.body.questions).toHaveLength(2)
		expect(response.body).toEqual({
			questions: expect.arrayContaining([
				expect.objectContaining({ title: 'New question' }),
				expect.objectContaining({ title: 'New question 2' }),
			]),
		})
	})
})
