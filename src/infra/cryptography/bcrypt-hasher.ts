import { Injectable } from '@nestjs/common'
import { compare, hash } from 'bcryptjs'
import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'

@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
	async hash(text: string): Promise<string> {
		return hash(text, 8)
	}

	async compare(text: string, hash: string): Promise<boolean> {
		return compare(text, hash)
	}
}
