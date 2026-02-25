import { InMemoryNotificationsRepository } from '@test/repositories/in-memory-notifications-repository'
import { SendNotificationUseCase } from './send-notification'

let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sut: SendNotificationUseCase

describe('SendNotificationUseCase', () => {
	beforeEach(() => {
		inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
		sut = new SendNotificationUseCase(inMemoryNotificationsRepository)
	})

	it('should be able to send a notification', async () => {
		const result = await sut.execute({
			recipientId: 'recipient-1',
			title: 'New notification',
			content: 'This is a test notification',
		})

		expect(result.isRight()).toBe(true)
		expect(inMemoryNotificationsRepository.items).toHaveLength(1)
		expect(inMemoryNotificationsRepository.items[0]).toEqual(result.value?.notification)
	})
})
