import { Injectable } from '@nestjs/common'
import { type Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { NotificationsRepository } from '../repositories/notifications-repository'

interface ReadNotificationParams {
	notificationId: string
	recipientId: string
}

type ReadNotificationResponse = Either<ResourceNotFoundError | NotAllowedError, object>

@Injectable()
export class ReadNotificationUseCase {
	constructor(private readonly notificationsRepository: NotificationsRepository) {}

	async execute({ notificationId, recipientId }: ReadNotificationParams): Promise<ReadNotificationResponse> {
		const notification = await this.notificationsRepository.findById(notificationId)

		if (!notification) {
			return left(new ResourceNotFoundError())
		}

		if (notification.recipientId.toString() !== recipientId) {
			return left(new NotAllowedError())
		}

		notification.read()

		await this.notificationsRepository.save(notification)

		return right({})
	}
}
