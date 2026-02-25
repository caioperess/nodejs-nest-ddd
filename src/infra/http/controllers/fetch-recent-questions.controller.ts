import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { z } from 'zod'

const pageQueryValidationSchema = z.coerce.number().min(1).default(1)

const queryValidationPipe = new ZodValidationPipe(pageQueryValidationSchema)

type PageQueryValidationSchema = z.infer<typeof pageQueryValidationSchema>

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
	constructor(private readonly prismaService: PrismaService) {}

	@Get()
	async handle(@Query('page', queryValidationPipe) page: PageQueryValidationSchema) {
		const questions = await this.prismaService.question.findMany({
			take: 20,
			skip: (page - 1) * 20,
			orderBy: {
				createdAt: 'desc',
			},
		})

		return { questions }
	}
}
