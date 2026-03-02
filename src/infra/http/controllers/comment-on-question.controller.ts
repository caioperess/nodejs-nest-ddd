import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { BadRequestException, Body, Controller, HttpCode, Param, Post } from '@nestjs/common'
import { z } from 'zod'

const commentOnQuestionBodySchema = z.object({
	content: z.string(),
})

type CommentOnQuestionBodySchema = z.infer<typeof commentOnQuestionBodySchema>

@Controller('questions/:questionId/comments')
export class CommentOnQuestionController {
	constructor(private readonly commentOnQuestion: CommentOnQuestionUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@CurrentUser() user: TokenPayload,
		@Body(new ZodValidationPipe(commentOnQuestionBodySchema)) body: CommentOnQuestionBodySchema,
		@Param('questionId') questionId: string,
	) {
		const { content } = body
		const userId = user.sub

		const result = await this.commentOnQuestion.execute({
			questionId,
			authorId: userId,
			content,
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
