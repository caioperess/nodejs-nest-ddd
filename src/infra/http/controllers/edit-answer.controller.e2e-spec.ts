import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AnswerFactory } from '@test/factories/make-answer'
import { AnswerAttachmentFactory } from '@test/factories/make-answer-attachment'
import { AttachmentFactory } from '@test/factories/make-attachment'
import { QuestionFactory } from '@test/factories/make-question'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('EditAnswer (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let jwt: JwtService
	let questionFactory: QuestionFactory
	let answerFactory: AnswerFactory
	let studentFactory: StudentFactory
	let attachmentFactory: AttachmentFactory
	let answerAttachmentFactory: AnswerAttachmentFactory

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, QuestionFactory, AnswerFactory, AttachmentFactory, AnswerAttachmentFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)
		answerFactory = moduleRef.get(AnswerFactory)
		attachmentFactory = moduleRef.get(AttachmentFactory)
		answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory)

		await app.init()
	})

	test('[PUT] /answers/:id', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const question = await questionFactory.makePrismaQuestion({
			authorId: user.id,
		})

		const attachment1 = await attachmentFactory.makePrismaAttachment()
		const attachment2 = await attachmentFactory.makePrismaAttachment()

		const answer = await answerFactory.makePrismaAnswer({
			questionId: question.id,
			authorId: user.id,
		})

		await answerAttachmentFactory.makePrismaAnswerAttachment({
			answerId: answer.id,
			attachmentId: attachment1.id,
		})

		await answerAttachmentFactory.makePrismaAnswerAttachment({
			answerId: answer.id,
			attachmentId: attachment2.id,
		})

		const attachment3 = await attachmentFactory.makePrismaAttachment()

		const response = await request(app.getHttpServer())
			.put(`/answers/${answer.id.toString()}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				content: 'Content of the answer',
				attachments: [attachment1.id.toString(), attachment3.id.toString()],
			})

		expect(response.statusCode).toBe(204)

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
					id: attachment3.id.toString(),
				}),
			]),
		)
	})
})
