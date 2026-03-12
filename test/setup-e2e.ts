import { DomainEvents } from '@/core/events/domain-events'
import { PrismaClient } from '@/generated/prisma/client'
import { envSchema } from '@/infra/env/env'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import Redis from 'ioredis'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const env = envSchema.parse(process.env)

let prisma: PrismaClient
const redis = new Redis({
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	db: env.REDIS_DB,
})
const schemaId = randomUUID()

function generateUniqueDatabaseURL(schemaId: string) {
	if (!env.DATABASE_URL) {
		throw new Error('Please provide a DATABASE_URL in the environment variables')
	}

	const url = new URL(env.DATABASE_URL)

	url.searchParams.set('schema', schemaId)

	return url.toString()
}

beforeAll(async () => {
	const databaseURL = generateUniqueDatabaseURL(schemaId)

	process.env.DATABASE_URL = databaseURL
	process.env.DATABASE_SCHEMA = schemaId

	prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString: databaseURL }),
	})

	DomainEvents.shouldRun = false

	await redis.flushdb()

	execSync('pnpm prisma migrate deploy')
})

afterAll(async () => {
	await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
	await prisma.$disconnect()
})
