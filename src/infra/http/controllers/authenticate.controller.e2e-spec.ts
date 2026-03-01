import { type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('Authenticate (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService

	beforeAll(async () => {
		const { AppModule } = await import('@/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)

		await app.init()
	})

	test('[POST] /sessions', async () => {
		await prisma.user.create({
			data: {
				name: 'John Doe',
				email: 'john.doe@example.com',
				password: await hash('123456', 8),
			},
		})

		const response = await request(app.getHttpServer()).post('/sessions').send({
			email: 'john.doe@example.com',
			password: '123456',
		})

		expect(response.statusCode).toBe(200)
		expect(response.body).toHaveProperty('access_token')
	})
})
