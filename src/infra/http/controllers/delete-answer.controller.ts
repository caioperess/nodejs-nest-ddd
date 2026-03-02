import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'
import { BadRequestException, Controller, Delete, HttpCode, Param } from '@nestjs/common'

@Controller('answers/:id')
export class DeleteAnswerController {
	constructor(private readonly deleteAnswer: DeleteAnswerUseCase) {}

	@Delete()
	@HttpCode(204)
	async handle(@CurrentUser() user: TokenPayload, @Param('id') answerId: string) {
		const userId = user.sub

		const result = await this.deleteAnswer.execute({
			authorId: userId,
			answerId,
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
