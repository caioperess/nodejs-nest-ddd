export abstract class HashComparer {
	abstract compare(text: string, hash: string): Promise<boolean>
}
