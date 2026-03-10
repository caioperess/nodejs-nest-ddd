import { type INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { NotificationFactory } from '@test/factories/make-notification'
import { StudentFactory } from '@test/factories/make-student'
import request from 'supertest'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Read Notification (E2E)', () => {
	let app: INestApplication
	let studentFactory: StudentFactory
	let notificationFactory: NotificationFactory
	let prisma: PrismaService
	let jwt: JwtService

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [StudentFactory, NotificationFactory, PrismaService],
		}).compile()

		app = moduleRef.createNestApplication()
		studentFactory = moduleRef.get(StudentFactory)
		notificationFactory = moduleRef.get(NotificationFactory)
		prisma = moduleRef.get(PrismaService)
		jwt = moduleRef.get(JwtService)

		await app.init()
	})

	test('[PATCH] /notifications/:notificationId/read', async () => {
		const user = await studentFactory.makePrismaStudent({
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: '123456',
		})

		const accessToken = jwt.sign({ sub: user.id.toString() })

		const notification = await notificationFactory.makePrismaNotification({
			recipientId: user.id,
		})

		const response = await request(app.getHttpServer())
			.patch(`/notifications/${notification.id.toString()}/read`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send()

		expect(response.statusCode).toBe(204)

		const notificationOnDB = await prisma.notification.findFirst({
			where: {
				recipientId: notification.recipientId.toString(),
			},
		})

		expect(notificationOnDB?.readAt).not.toBeNull()
	})
})
