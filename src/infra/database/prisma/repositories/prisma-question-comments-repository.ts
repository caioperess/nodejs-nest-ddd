import { Injectable } from '@nestjs/common'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { PrismaCommentWithAuthorMapper } from '../mappers/prisma-comment-with-author-mapper'
import { PrismaQuestionCommentMapper } from '../mappers/prisma-question-comment-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaQuestionCommentsRepository implements QuestionCommentsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(questionComment: QuestionComment): Promise<void> {
		await this.prisma.comment.create({
			data: PrismaQuestionCommentMapper.toPrisma(questionComment),
		})
	}

	async delete(questionComment: QuestionComment): Promise<void> {
		await this.prisma.comment.delete({
			where: {
				id: questionComment.id.toString(),
			},
		})
	}

	async findById(id: string): Promise<QuestionComment | null> {
		const comment = await this.prisma.comment.findUnique({
			where: {
				id,
			},
		})

		if (!comment) {
			return null
		}

		return PrismaQuestionCommentMapper.toDomain(comment)
	}

	async findManyByQuestionId(questionId: string, params: PaginationParams): Promise<QuestionComment[]> {
		const comments = await this.prisma.comment.findMany({
			where: {
				questionId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip: (params.page - 1) * 20,
			take: 20,
		})

		return comments.map(PrismaQuestionCommentMapper.toDomain)
	}

	async findManyByQuestionIdWithAuthor(questionId: string, { page }: PaginationParams): Promise<CommentWithAuthor[]> {
		const comments = await this.prisma.comment.findMany({
			include: {
				author: true,
			},
			where: {
				questionId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip: (page - 1) * 20,
			take: 20,
		})

		return comments.map(PrismaCommentWithAuthorMapper.toDomain)
	}
}
