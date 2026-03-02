import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AnswerFactory } from '@test/factories/make-answer'
import { AnswerCommentFactory } from '@test/factories/make-answer-comment'
import { QuestionFactory } from '@test/factories/make-question'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'

describe('DeleteAnswerComment (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
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
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)
		answerCommentFactory = moduleRef.get(AnswerCommentFactory)
		answerFactory = moduleRef.get(AnswerFactory)

		await app.init()
	})

	test('[DELETE] /answers/comments/:id', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const question = await questionFactory.makePrismaQuestion({
			authorId: user.id,
		})

		const answer = await answerFactory.makePrismaAnswer({
			questionId: question.id,
			authorId: user.id,
		})

		const answerComment = await answerCommentFactory.makePrismaAnswerComment({
			answerId: answer.id,
			authorId: user.id,
		})

		const response = await request(app.getHttpServer())
			.delete(`/answers/comments/${answerComment.id.toString()}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send()

		expect(response.statusCode).toBe(204)

		const answerCommentOnDB = await prisma.comment.findUnique({
			where: {
				id: answerComment.id.toString(),
			},
		})

		expect(answerCommentOnDB).toBeNull()
	})
})
