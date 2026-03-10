import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common'
import { z } from 'zod'
import { FetchQuestionAnswersUseCase } from '@/domain/forum/application/use-cases/fetch-question-answers'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { AnswerPresenter } from '../presenters/answer-presenter'

const pageQueryValidationSchema = z.coerce.number().min(1).default(1)

const queryValidationPipe = new ZodValidationPipe(pageQueryValidationSchema)

type PageQueryValidationSchema = z.infer<typeof pageQueryValidationSchema>

@Controller('questions/:questionId/answers')
export class FetchQuestionAnswersController {
	constructor(private readonly fetchQuestionAnswers: FetchQuestionAnswersUseCase) {}

	@Get()
	async handle(
		@Query('page', queryValidationPipe) page: PageQueryValidationSchema,
		@Param('questionId') questionId: string,
	) {
		const result = await this.fetchQuestionAnswers.execute({ page, questionId })

		if (result.isLeft()) {
			throw new BadRequestException()
		}

		const { answers } = result.value

		return { answers: answers.map(AnswerPresenter.toHTTP) }
	}
}
