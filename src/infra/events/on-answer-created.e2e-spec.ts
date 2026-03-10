import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { QuestionFactory } from '@test/factories/make-question'
import { StudentFactory } from '@test/factories/make-student'
import { waitFor } from '@test/utils/wait-for'
import request from 'supertest'
import { DomainEvents } from '@/core/events/domain-events'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('OnAnswerCreated (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let jwt: JwtService
	let questionFactory: QuestionFactory
	let studentFactory: StudentFactory

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, QuestionFactory],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)
		studentFactory = moduleRef.get(StudentFactory)
		questionFactory = moduleRef.get(QuestionFactory)

		DomainEvents.shouldRun = true

		await app.init()
	})

	it('should send a notification when an answer is created', async () => {
		const user = await studentFactory.makePrismaStudent()

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const question = await questionFactory.makePrismaQuestion({
			authorId: user.id,
		})

		await request(app.getHttpServer())
			.post(`/questions/${question.id.toString()}/answers`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				content: 'Content of the answer',
				attachments: [],
			})

		await waitFor(async () => {
			const notificationOnDB = await prisma.notification.findFirst({
				where: {
					recipientId: user.id.toString(),
				},
			})

			expect(notificationOnDB).toBeTruthy()
		})
	})
})
