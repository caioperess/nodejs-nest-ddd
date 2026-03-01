import { Module } from '@nestjs/common'
import { Encrypter } from '@/domain/forum/application/cryptography/encrypter'
import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'
import { BcryptHasher } from './bcrypt-hasher'
import { JwtEncrypter } from './jwt-encrypter'

@Module({
	providers: [
		{
			provide: HashGenerator,
			useClass: BcryptHasher,
		},
		{
			provide: HashComparer,
			useClass: BcryptHasher,
		},
		{
			provide: Encrypter,
			useClass: JwtEncrypter,
		},
	],
	exports: [HashComparer, HashGenerator, Encrypter],
})
export class CryptographyModule {}
