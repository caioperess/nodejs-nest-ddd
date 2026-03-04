import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AttachmentFactory } from '@test/factories/make-attachment'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'

describe('CreateQuestion (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let jwt: JwtService
	let studentFactory: StudentFactory
	let attachmentFactory: AttachmentFactory

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, AttachmentFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		attachmentFactory = moduleRef.get(AttachmentFactory)

		await app.init()
	})

	test('[POST] /questions', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const attachment1 = await attachmentFactory.makePrismaAttachment()
		const attachment2 = await attachmentFactory.makePrismaAttachment()

		const response = await request(app.getHttpServer())
			.post('/questions')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				title: 'New question',
				content: 'Content of the question',
				attachments: [attachment1.id.toString(), attachment2.id.toString()],
			})

		expect(response.statusCode).toBe(201)

		const questionOnDB = await prisma.question.findFirst({
			where: {
				title: 'New question',
			},
		})

		const questionAttachmentsOnDB = await prisma.attachment.findMany({
			where: {
				questionId: questionOnDB?.id,
			},
		})

		expect(questionOnDB).toBeTruthy()
		expect(questionAttachmentsOnDB).toHaveLength(2)
		expect(questionAttachmentsOnDB).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: attachment1.id.toString(),
					questionId: questionOnDB?.id,
				}),
				expect.objectContaining({
					id: attachment2.id.toString(),
					questionId: questionOnDB?.id,
				}),
			]),
		)
	})
})
