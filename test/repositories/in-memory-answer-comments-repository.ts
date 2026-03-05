import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import type { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { InMemoryStudentsRepository } from './in-memory-students-repository'

export class InMemoryAnswerCommentsRepository implements AnswerCommentsRepository {
	public items: AnswerComment[] = []

	constructor(private readonly studentsRepository?: InMemoryStudentsRepository) {}

	async create(answerComment: AnswerComment): Promise<void> {
		this.items.push(answerComment)
	}

	async delete(answerComment: AnswerComment): Promise<void> {
		const index = this.items.indexOf(answerComment)
		this.items.splice(index, 1)
	}

	async findById(id: string): Promise<AnswerComment | null> {
		return this.items.find((item) => item.id.toString() === id) || null
	}

	async findManyByAnswerId(answerId: string, params: PaginationParams): Promise<AnswerComment[]> {
		return this.items
			.filter((item) => item.answerId.toString() === answerId)
			.slice((params.page - 1) * 20, params.page * 20)
	}

	async findManyByAnswerIdWithAuthor(answerId: string, params: PaginationParams): Promise<CommentWithAuthor[]> {
		const answerComments = this.items
			.filter((item) => item.answerId.toString() === answerId)
			.slice((params.page - 1) * 20, params.page * 20)

		return answerComments.map((comment) => {
			const author = this.studentsRepository?.items.find((student) => student.id.equals(comment.authorId))

			if (!author) {
				throw new Error(`Author with ID "${comment.authorId}" not found`)
			}

			return CommentWithAuthor.create({
				commentId: comment.id,
				authorId: comment.authorId,
				content: comment.content,
				createdAt: comment.createdAt,
				updatedAt: comment.updatedAt,
				author: author.name,
			})
		})
	}
}
