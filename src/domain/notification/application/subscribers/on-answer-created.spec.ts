import { makeAnswer } from '@test/factories/make-answer'
import { makeQuestion } from '@test/factories/make-question'
import { InMemoryAnswersRepository } from '@test/repositories/in-memory-answers-repository'
import { InMemoryNotificationsRepository } from '@test/repositories/in-memory-notifications-repository'
import { InMemoryQuestionsRepository } from '@test/repositories/in-memory-questions-repository'
import type { MockInstance } from 'vitest'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { OnAnswerCreated } from './on-answer-created'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let questionsRepository: InMemoryQuestionsRepository
let notificationsRepository: InMemoryNotificationsRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotificationUseCaseSpy: MockInstance<typeof sendNotificationUseCase.execute>

describe('OnAnswerCreated', () => {
	beforeEach(() => {
		inMemoryAnswersRepository = new InMemoryAnswersRepository()
		questionsRepository = new InMemoryQuestionsRepository()
		notificationsRepository = new InMemoryNotificationsRepository()
		sendNotificationUseCase = new SendNotificationUseCase(notificationsRepository)

		sendNotificationUseCaseSpy = vi.spyOn(sendNotificationUseCase, 'execute')

		new OnAnswerCreated(questionsRepository, sendNotificationUseCase)
	})

	it('should be able to send a notification when an answer is created', async () => {
		const question = makeQuestion()
		const answer = makeAnswer({ questionId: question.id })

		await questionsRepository.create(question)
		await inMemoryAnswersRepository.create(answer)

		expect(sendNotificationUseCaseSpy).toHaveBeenCalled()
	})
})
