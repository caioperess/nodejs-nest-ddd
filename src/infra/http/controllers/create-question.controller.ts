import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { z } from 'zod'

const createQuestionBodySchema = z.object({
	title: z.string(),
	content: z.string(),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
	constructor(private readonly createQuestion: CreateQuestionUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@CurrentUser() user: TokenPayload,
		@Body(new ZodValidationPipe(createQuestionBodySchema)) body: CreateQuestionBodySchema,
	) {
		const { title, content } = body
		const userId = user.sub

		await this.createQuestion.execute({
			authorId: userId,
			title,
			content,
			attachmentsIds: [],
		})
	}
}
