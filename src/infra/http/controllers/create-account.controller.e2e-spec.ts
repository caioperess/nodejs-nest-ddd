import { type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

describe('CreateAccount (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService

	beforeAll(async () => {
		const { AppModule } = await import('@/infra/app.module.js')

		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleRef.createNestApplication()
		prisma = moduleRef.get(PrismaService)

		await app.init()
	})

	test('[POST] /accounts', async () => {
		const response = await request(app.getHttpServer()).post('/accounts').send({
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: '123456',
		})

		expect(response.statusCode).toBe(201)

		const userOnDB = await prisma.user.findUnique({
			where: {
				email: 'john.doe@example.com',
			},
		})

		expect(userOnDB).toBeTruthy()
	})
})
