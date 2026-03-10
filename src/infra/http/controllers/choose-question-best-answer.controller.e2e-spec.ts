import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AnswerFactory } from '@test/factories/make-answer'
import { QuestionFactory } from '@test/factories/make-question'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('ChooseQuestionBestAnswer (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let jwt: JwtService
	let questionFactory: QuestionFactory
	let answerFactory: AnswerFactory
	let studentFactory: StudentFactory

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, QuestionFactory, AnswerFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)
		answerFactory = moduleRef.get(AnswerFactory)

		await app.init()
	})

	test('[PATCH] /answers/:id', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const question = await questionFactory.makePrismaQuestion({
			authorId: user.id,
		})

		const answer = await answerFactory.makePrismaAnswer({
			questionId: question.id,
			authorId: user.id,
		})

		const response = await request(app.getHttpServer())
			.patch(`/answers/${answer.id.toString()}/choose-as-best`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send()

		expect(response.statusCode).toBe(204)

		const questionOnDB = await prisma.question.findFirst({
			where: {
				bestAnswerId: answer.id.toString(),
			},
		})

		expect(questionOnDB).toBeTruthy()
	})
})
