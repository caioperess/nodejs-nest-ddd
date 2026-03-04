import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'
import { Injectable } from '@nestjs/common'
import { PrismaQuestionAttachmentMapper } from '../mappers/prisma-question-attachment-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaQuestionAttachmentsRepository implements QuestionAttachmentsRepository {
	constructor(private readonly prisma: PrismaService) {}

	async createMany(questionAttachments: QuestionAttachment[]): Promise<void> {
		if (questionAttachments.length === 0) {
			return
		}

		const data = PrismaQuestionAttachmentMapper.toPrismaUpdateMany(questionAttachments)

		await this.prisma.attachment.updateMany(data)
	}

	async deleteMany(questionAttachments: QuestionAttachment[]): Promise<void> {
		if (questionAttachments.length === 0) {
			return
		}

		const attachmentIds = questionAttachments.map((attachment) => attachment.id.toString())

		await this.prisma.attachment.deleteMany({
			where: {
				id: {
					in: attachmentIds,
				},
			},
		})
	}

	async findManyByQuestionId(questionId: string): Promise<QuestionAttachment[]> {
		const questionAttachments = await this.prisma.attachment.findMany({
			where: {
				questionId,
			},
		})

		return questionAttachments.map(PrismaQuestionAttachmentMapper.toDomain)
	}

	async deleteManyByQuestionId(questionId: string): Promise<void> {
		await this.prisma.attachment.deleteMany({
			where: {
				questionId,
			},
		})
	}
}
