import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { Env } from '@/infra/env/env'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor(configService: ConfigService<Env, true>) {
		const connectionString = configService.get('DATABASE_URL', { infer: true })
		const schema = configService.get('DATABASE_SCHEMA', { infer: true })
		const adapter = new PrismaPg({ connectionString }, { schema })

		super({
			adapter,
			log: ['warn', 'error'],
		})
	}

	onModuleInit() {
		return this.$connect()
	}

	onModuleDestroy() {
		return this.$disconnect()
	}
}
