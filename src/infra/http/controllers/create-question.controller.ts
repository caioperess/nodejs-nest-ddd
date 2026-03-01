import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common'
import { z } from 'zod'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

const createQuestionBodySchema = z.object({
	title: z.string(),
	content: z.string(),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('questions')
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

		const result = await this.createQuestion.execute({
			authorId: userId,
			title,
			content,
			attachmentsIds: [],
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
