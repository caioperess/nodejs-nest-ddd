import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import type { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { InMemoryStudentsRepository } from './in-memory-students-repository'

export class InMemoryQuestionCommentsRepository implements QuestionCommentsRepository {
	public items: QuestionComment[] = []

	constructor(private readonly studentsRepository?: InMemoryStudentsRepository) {}

	async create(questionComment: QuestionComment): Promise<void> {
		this.items.push(questionComment)
	}

	async delete(questionComment: QuestionComment): Promise<void> {
		const index = this.items.indexOf(questionComment)
		this.items.splice(index, 1)
	}

	async findById(id: string): Promise<QuestionComment | null> {
		return this.items.find((item) => item.id.toString() === id) || null
	}

	async findManyByQuestionId(questionId: string, { page }: PaginationParams): Promise<QuestionComment[]> {
		return this.items.filter((item) => item.questionId.toString() === questionId).slice((page - 1) * 20, page * 20)
	}

	async findManyByQuestionIdWithAuthor(questionId: string, params: PaginationParams): Promise<CommentWithAuthor[]> {
		const questionComments = this.items
			.filter((item) => item.questionId.toString() === questionId)
			.slice((params.page - 1) * 20, params.page * 20)

		return questionComments.map((comment) => {
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
