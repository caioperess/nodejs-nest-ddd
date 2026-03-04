import { PaginationParams } from '@/core/repositories/pagination-params'
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { Injectable } from '@nestjs/common'
import { PrismaAnswerMapper } from '../mappers/prisma-answer-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly answerAttachmentsRepository: AnswerAttachmentsRepository,
	) {}

	async create(answer: Answer): Promise<void> {
		await this.prisma.answer.create({
			data: PrismaAnswerMapper.toPrisma(answer),
		})

		await this.answerAttachmentsRepository.createMany(answer.attachments.getItems())
	}

	async save(answer: Answer): Promise<void> {
		await Promise.all([
			this.prisma.answer.update({
				where: {
					id: answer.id.toString(),
				},
				data: PrismaAnswerMapper.toPrisma(answer),
			}),
			this.answerAttachmentsRepository.createMany(answer.attachments.getNewItems()),
			this.answerAttachmentsRepository.deleteMany(answer.attachments.getRemovedItems()),
		])
	}

	async delete(answer: Answer): Promise<void> {
		await this.prisma.answer.delete({
			where: {
				id: answer.id.toString(),
			},
		})
	}

	async findById(id: string): Promise<Answer | null> {
		const answer = await this.prisma.answer.findUnique({
			where: {
				id,
			},
		})

		if (!answer) {
			return null
		}

		return PrismaAnswerMapper.toDomain(answer)
	}

	async findManyByQuestionId(questionId: string, { page }: PaginationParams): Promise<Answer[]> {
		const answers = await this.prisma.answer.findMany({
			where: {
				questionId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip: (page - 1) * 20,
			take: 20,
		})

		return answers.map(PrismaAnswerMapper.toDomain)
	}
}
