import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import {
	Attachment as PrismaAttachment,
	Question as PrismaQuestion,
	User as PrismaUser,
} from '@/generated/prisma/client'
import { PrismaAttachmentMapper } from './prisma-attachment-mapper'

type PrismaQuestionDetails = PrismaQuestion & {
	author: PrismaUser
	attachments: PrismaAttachment[]
}

export class PrismaQuestionDetailsMapper {
	static toDomain(raw: PrismaQuestionDetails): QuestionDetails {
		return QuestionDetails.create({
			questionId: new UniqueEntityID(raw.id),
			authorId: new UniqueEntityID(raw.authorId),
			bestAnswerId: raw.bestAnswerId ? new UniqueEntityID(raw.bestAnswerId) : null,
			author: raw.author.name,
			content: raw.content,
			title: raw.title,
			slug: Slug.create(raw.slug),
			attachments: raw.attachments.map((attachment) => PrismaAttachmentMapper.toDomain(attachment)),
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		})
	}
}
