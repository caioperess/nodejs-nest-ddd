import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { TokenPayload } from '@/infra/auth/jwt-strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { BadRequestException, Body, Controller, HttpCode, Param, Put } from '@nestjs/common'
import { z } from 'zod'

const editAnswerBodySchema = z.object({
	content: z.string(),
	attachments: z.array(z.uuid()),
})

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

@Controller('answers/:id')
export class EditAnswerController {
	constructor(private readonly editAnswer: EditAnswerUseCase) {}

	@Put()
	@HttpCode(204)
	async handle(
		@CurrentUser() user: TokenPayload,
		@Body(new ZodValidationPipe(editAnswerBodySchema)) body: EditAnswerBodySchema,
		@Param('id') id: string,
	) {
		const { content, attachments } = body
		const userId = user.sub

		const result = await this.editAnswer.execute({
			answerId: id,
			authorId: userId,
			content,
			attachmentsIds: attachments,
		})

		if (result.isLeft()) {
			throw new BadRequestException()
		}
	}
}
