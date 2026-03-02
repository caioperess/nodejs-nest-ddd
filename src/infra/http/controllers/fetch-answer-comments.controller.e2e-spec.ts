import { DatabaseModule } from '@/infra/database/database.module'
import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AnswerFactory } from '@test/factories/make-answer'
import { AnswerCommentFactory } from '@test/factories/make-answer-comment'
import { QuestionFactory } from '@test/factories/make-question'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'

describe('FetchQuestionComments (E2E)', () => {
	let app: INestApplication
	let jwt: JwtService
	let questionFactory: QuestionFactory
	let answerFactory: AnswerFactory
	let answerCommentFactory: AnswerCommentFactory
	let studentFactory: StudentFactory

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, QuestionFactory, AnswerFactory, AnswerCommentFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)
		answerFactory = moduleRef.get(AnswerFactory)
		answerCommentFactory = moduleRef.get(AnswerCommentFactory)

		await app.init()
	})

	test('[GET] /answers/:answerId/comments', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const question = await questionFactory.makePrismaQuestion({
			authorId: user.id,
		})

		const answer = await answerFactory.makePrismaAnswer({
			questionId: question.id,
			authorId: user.id,
		})

		await Promise.all([
			answerCommentFactory.makePrismaAnswerComment({
				answerId: answer.id,
				authorId: user.id,
				content: 'Comment 1',
			}),
			answerCommentFactory.makePrismaAnswerComment({
				answerId: answer.id,
				authorId: user.id,
				content: 'Comment 2',
			}),
		])

		const response = await request(app.getHttpServer())
			.get(`/answers/${answer.id.toString()}/comments`)
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
