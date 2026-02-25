import 'dotenv/config'

import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

let prisma: PrismaClient
const schemaId = randomUUID()

function generateUniqueDatabaseURL(schemaId: string) {
	if (!process.env.DATABASE_URL) {
		throw new Error('Please provide a DATABASE_URL in the environment variables')
	}

	const url = new URL(process.env.DATABASE_URL)

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

	execSync('pnpm prisma migrate deploy')
})

afterAll(async () => {
	await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
	await prisma.$disconnect()
})
