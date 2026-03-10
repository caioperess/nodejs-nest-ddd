import { BadRequestException, Body, Controller, HttpCode, Param, Post } from '@nestjs/common'
import { z } from 'zod'
import { CommentOnAnswerUseCase } from '@/domain/forum/application/use-cases/comment-on-answer'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

const commentOnAnswerBodySchema = z.object({
	content: z.string(),
})

type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>

@Controller('answers/:answerId/comments')
export class CommentOnAnswerController {
	constructor(private readonly commentOnAnswer: CommentOnAnswerUseCase) {}

	@Post()
	@HttpCode(201)
	async handle(
		@CurrentUser() user: TokenPayload,
		@Body(new ZodValidationPipe(commentOnAnswerBodySchema)) body: CommentOnAnswerBodySchema,
		@Param('answerId') answerId: string,
	) {
		const { content } = body
		const userId = user.sub

		const result = await this.commentOnAnswer.execute({
			answerId,
			authorId: userId,
			content,
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
