import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'

export class FakeHasher implements HashGenerator, HashComparer {
	async compare(text: string, hash: string): Promise<boolean> {
		return text.concat('hashed') === hash
	}

	async hash(text: string): Promise<string> {
		return text.concat('hashed')
	}
}
