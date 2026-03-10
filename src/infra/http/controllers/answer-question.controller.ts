import { BadRequestException, Body, Controller, HttpCode, Param, Post } from '@nestjs/common'
import { z } from 'zod'
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

const answerQuestionBodySchema = z.object({
	content: z.string(),
	attachments: z.array(z.uuid()),
})

type AnswerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>

@Controller('questions/:questionId/answers')
export class AnswerQuestionController {
	constructor(private readonly answerQuestion: AnswerQuestionUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@CurrentUser() user: TokenPayload,
		@Body(new ZodValidationPipe(answerQuestionBodySchema)) body: AnswerQuestionBodySchema,
		@Param('questionId') questionId: string,
	) {
		const { content, attachments } = body
		const userId = user.sub

		const result = await this.answerQuestion.execute({
			questionId,
			authorId: userId,
			content,
			attachmentsIds: attachments,
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
