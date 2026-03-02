import { DeleteQuestionCommentUseCase } from '@/domain/forum/application/use-cases/delete-question-comment'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'
import { BadRequestException, Controller, Delete, HttpCode, Param } from '@nestjs/common'

@Controller('questions/comments/:id')
export class DeleteQuestionCommentController {
	constructor(private readonly deleteQuestionComment: DeleteQuestionCommentUseCase) {}

	@Delete()
	@HttpCode(204)
	async handle(@CurrentUser() user: TokenPayload, @Param('id') questionCommentId: string) {
		const userId = user.sub

		const result = await this.deleteQuestionComment.execute({
			authorId: userId,
			questionCommentId,
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
