import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common'
import { z } from 'zod'
import { CommentPresenter } from '../presenters/comment-presenter'

const pageQueryValidationSchema = z.coerce.number().min(1).default(1)

const queryValidationPipe = new ZodValidationPipe(pageQueryValidationSchema)

type PageQueryValidationSchema = z.infer<typeof pageQueryValidationSchema>

@Controller('questions/:questionId/comments')
export class FetchQuestionCommentsController {
	constructor(private readonly fetchQuestionComments: FetchQuestionCommentsUseCase) {}

	@Get()
	async handle(
		@Query('page', queryValidationPipe) page: PageQueryValidationSchema,
		@Param('questionId') questionId: string,
	) {
		const result = await this.fetchQuestionComments.execute({ questionId, page })

		if (result.isLeft()) {
			throw new BadRequestException()
		}

		const { comments } = result.value

		return { comments: comments.map(CommentPresenter.toHTTP) }
	}
}
