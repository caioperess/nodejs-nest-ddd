import { PaginationParams } from '@/core/repositories/pagination-params'
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { Injectable } from '@nestjs/common'
import { PrismaAnswerCommentMapper } from '../mappers/prisma-answer-comment-mapper'
import { PrismaCommentWithAuthorMapper } from '../mappers/prisma-comment-with-author-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAnswerCommentsRepository implements AnswerCommentsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(answerComment: AnswerComment): Promise<void> {
		await this.prisma.comment.create({
			data: PrismaAnswerCommentMapper.toPrisma(answerComment),
		})
	}

	async delete(answerComment: AnswerComment): Promise<void> {
		await this.prisma.comment.delete({
			where: {
				id: answerComment.id.toString(),
			},
		})
	}

	async findById(id: string): Promise<AnswerComment | null> {
		const comment = await this.prisma.comment.findUnique({
			where: {
				id,
			},
		})

		if (!comment) {
			return null
		}

		return PrismaAnswerCommentMapper.toDomain(comment)
	}

	async findManyByAnswerId(answerId: string, { page }: PaginationParams): Promise<AnswerComment[]> {
		const comments = await this.prisma.comment.findMany({
			where: {
				answerId,
			},
			take: 20,
			skip: (page - 1) * 20,
		})

		return comments.map(PrismaAnswerCommentMapper.toDomain)
	}

	async findManyByAnswerIdWithAuthor(answerId: string, { page }: PaginationParams): Promise<CommentWithAuthor[]> {
		const comments = await this.prisma.comment.findMany({
			include: {
				author: true,
			},
			where: {
				answerId,
			},
			take: 20,
			skip: (page - 1) * 20,
		})

		return comments.map(PrismaCommentWithAuthorMapper.toDomain)
	}
}
