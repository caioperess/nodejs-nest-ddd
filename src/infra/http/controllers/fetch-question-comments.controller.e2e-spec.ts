import { DatabaseModule } from '@/infra/database/database.module'
import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { QuestionFactory } from '@test/factories/make-question'
import { QuestionCommentFactory } from '@test/factories/make-question-comment'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'

describe('FetchQuestionComments (E2E)', () => {
	let app: INestApplication
	let jwt: JwtService
	let questionFactory: QuestionFactory
	let questionCommentFactory: QuestionCommentFactory
	let studentFactory: StudentFactory

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)
		questionCommentFactory = moduleRef.get(QuestionCommentFactory)

		await app.init()
	})

	test('[GET] /questions/:questionId/comments', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const question = await questionFactory.makePrismaQuestion({
			authorId: user.id,
		})

		await Promise.all([
			questionCommentFactory.makePrismaQuestionComment({
				questionId: question.id,
				authorId: user.id,
				content: 'Comment 1',
			}),
			questionCommentFactory.makePrismaQuestionComment({
				questionId: question.id,
				authorId: user.id,
				content: 'Comment 2',
			}),
		])

		const response = await request(app.getHttpServer())
			.get(`/questions/${question.id.toString()}/comments`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send()

		expect(response.statusCode).toBe(200)
		expect(response.body).toEqual({
			comments: expect.arrayContaining([
				expect.objectContaining({ content: 'Comment 1' }),
				expect.objectContaining({ content: 'Comment 2' }),
			]),
		})
	})
})
