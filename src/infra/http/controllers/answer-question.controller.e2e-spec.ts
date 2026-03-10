import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AttachmentFactory } from '@test/factories/make-attachment'
import { QuestionFactory } from '@test/factories/make-question'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('AnswerQuestion (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let jwt: JwtService
	let questionFactory: QuestionFactory
	let studentFactory: StudentFactory
	let attachmentFactory: AttachmentFactory

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, QuestionFactory, AttachmentFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)
		attachmentFactory = moduleRef.get(AttachmentFactory)

		await app.init()
	})

	test('[POST] /questions/:questionId/answers', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const question = await questionFactory.makePrismaQuestion({
			authorId: user.id,
		})

		const attachment1 = await attachmentFactory.makePrismaAttachment()
		const attachment2 = await attachmentFactory.makePrismaAttachment()

		const response = await request(app.getHttpServer())
			.post(`/questions/${question.id.toString()}/answers`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				content: 'Content of the answer',
				attachments: [attachment1.id.toString(), attachment2.id.toString()],
			})

		expect(response.statusCode).toBe(201)

		const answerOnDB = await prisma.answer.findFirst({
			where: {
				content: 'Content of the answer',
			},
		})

		const answerAttachmentsOnDB = await prisma.attachment.findMany({
			where: {
				answerId: answerOnDB?.id,
			},
		})

		expect(answerOnDB).toBeTruthy()
		expect(answerAttachmentsOnDB).toHaveLength(2)
		expect(answerAttachmentsOnDB).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: attachment1.id.toString(),
				}),
				expect.objectContaining({
					id: attachment2.id.toString(),
				}),
			]),
		)
	})
})
