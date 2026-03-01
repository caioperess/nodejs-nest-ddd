import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { QuestionPresenter } from '../presenters/question-presenter'

const pageQueryValidationSchema = z.coerce.number().min(1).default(1)

const queryValidationPipe = new ZodValidationPipe(pageQueryValidationSchema)

type PageQueryValidationSchema = z.infer<typeof pageQueryValidationSchema>

@Controller('questions')
export class FetchRecentQuestionsController {
	constructor(private readonly fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

	@Get()
	async handle(@Query('page', queryValidationPipe) page: PageQueryValidationSchema) {
		const result = await this.fetchRecentQuestions.execute({ page })

		if (result.isLeft()) {
			throw new BadRequestException()
		}

		const { questions } = result.value

		return { questions: questions.map(QuestionPresenter.toHTTP) }
	}
}
