import { BadRequestException, Controller, Delete, HttpCode, Param } from '@nestjs/common'
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'

@Controller('questions/:id')
export class DeleteQuestionController {
	constructor(private readonly deleteQuestion: DeleteQuestionUseCase) {}

	@Delete()
	@HttpCode(200)
	async handle(@CurrentUser() user: TokenPayload, @Param('id') questionId: string) {
		const userId = user.sub

		const result = await this.deleteQuestion.execute({
			authorId: userId,
			questionId,
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
