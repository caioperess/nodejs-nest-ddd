import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Answer, type AnswerProps } from '@/domain/forum/enterprise/entities/answer'

export function makeAnswer(override: Partial<AnswerProps> = {}, id?: UniqueEntityID) {
	const answer = Answer.create(
		{
			questionId: new UniqueEntityID(),
			authorId: new UniqueEntityID(),
			content: faker.lorem.text(),
			...override,
		},
		id,
	)

	return answer
}
