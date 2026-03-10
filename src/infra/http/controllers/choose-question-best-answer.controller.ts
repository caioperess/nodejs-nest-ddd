import { BadRequestException, Controller, HttpCode, Param, Patch } from '@nestjs/common'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-question-best-answer'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'

@Controller('answers/:answerId/choose-as-best')
export class ChooseQuestionBestAnswerController {
	constructor(private readonly chooseQuestionBestAnswer: ChooseQuestionBestAnswerUseCase) {}

	@Patch()
	@HttpCode(204)
	async handle(@CurrentUser() user: TokenPayload, @Param('answerId') answerId: string) {
		const userId = user.sub

		const result = await this.chooseQuestionBestAnswer.execute({
			answerId,
			authorId: userId,
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
