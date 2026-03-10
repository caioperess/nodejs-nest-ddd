import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common'
import { z } from 'zod'
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CommentWithAuthorPresenter } from '../presenters/comment-with-author-presenter'

const pageQueryValidationSchema = z.coerce.number().min(1).default(1)

const queryValidationPipe = new ZodValidationPipe(pageQueryValidationSchema)

type PageQueryValidationSchema = z.infer<typeof pageQueryValidationSchema>

@Controller('answers/:answerId/comments')
export class FetchAnswerCommentsController {
	constructor(private readonly fetchAnswerComments: FetchAnswerCommentsUseCase) {}

	@Get()
	async handle(
		@Query('page', queryValidationPipe) page: PageQueryValidationSchema,
		@Param('answerId') answerId: string,
	) {
		const result = await this.fetchAnswerComments.execute({ answerId, page })

		if (result.isLeft()) {
			throw new BadRequestException()
		}

		const { comments } = result.value

		return { comments: comments.map(CommentWithAuthorPresenter.toHTTP) }
	}
}
