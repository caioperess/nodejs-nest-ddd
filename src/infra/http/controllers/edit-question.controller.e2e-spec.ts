import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AttachmentFactory } from '@test/factories/make-attachment'
import { QuestionFactory } from '@test/factories/make-question'
import { QuestionAttachmentFactory } from '@test/factories/make-question-attachment'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'

describe('EditQuestion (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let jwt: JwtService
	let questionFactory: QuestionFactory
	let studentFactory: StudentFactory
	let attachmentFactory: AttachmentFactory
	let questionAttachmentFactory: QuestionAttachmentFactory

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, QuestionFactory, AttachmentFactory, QuestionAttachmentFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)
		attachmentFactory = moduleRef.get(AttachmentFactory)
		questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory)

		await app.init()
	})

	test('[PUT] /questions/:id', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const attachment1 = await attachmentFactory.makePrismaAttachment()
		const attachment2 = await attachmentFactory.makePrismaAttachment()

		const question = await questionFactory.makePrismaQuestion({
			authorId: user.id,
		})

		await questionAttachmentFactory.makePrismaQuestionAttachment({
			questionId: question.id,
			attachmentId: attachment1.id,
		})

		await questionAttachmentFactory.makePrismaQuestionAttachment({
			questionId: question.id,
			attachmentId: attachment2.id,
		})

		const attachment3 = await attachmentFactory.makePrismaAttachment()

		const response = await request(app.getHttpServer())
			.put(`/questions/${question.id.toString()}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				title: 'New question',
				content: 'Content of the question',
				attachments: [attachment1.id.toString(), attachment3.id.toString()],
			})

		expect(response.statusCode).toBe(204)

		const questionOnDB = await prisma.question.findFirst({
			where: {
				title: 'New question',
			},
		})

		const questionAttachmentsOnDB = await prisma.attachment.findMany({
			where: {
				questionId: question.id.toString(),
			},
		})

		expect(questionOnDB).toBeTruthy()
		expect(questionAttachmentsOnDB).toHaveLength(2)
		expect(questionAttachmentsOnDB).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: attachment1.id.toString(),
					questionId: question.id.toString(),
				}),
				expect.objectContaining({
					id: attachment3.id.toString(),
					questionId: question.id.toString(),
				}),
			]),
		)
	})
})
