import { type Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Notification } from '../../enterprise/entities/notification'
import type { NotificationsRepository } from '../repositories/notifications-repository'

interface SendNotificationParams {
	recipientId: string
	title: string
	content: string
}

type SendNotificationResponse = Either<null, { notification: Notification }>

export class SendNotificationUseCase {
	constructor(private readonly notificationsRepository: NotificationsRepository) {}

	async execute({ recipientId, title, content }: SendNotificationParams): Promise<SendNotificationResponse> {
		const notification = Notification.create({
			recipientId: new UniqueEntityID(recipientId),
			title,
			content,
		})

		await this.notificationsRepository.create(notification)

		return right({ notification })
	}
}
