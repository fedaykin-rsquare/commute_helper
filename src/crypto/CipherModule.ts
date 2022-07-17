import {BinaryToTextEncoding, Cipher, createCipheriv, createDecipheriv, createHash, Encoding, scryptSync} from 'crypto';

class CipherModule {
	private inputEncoding: Encoding = (<Encoding> process.env.input_encoding);
	private outputEncoding: BinaryToTextEncoding = (<BinaryToTextEncoding> process.env.output_encoding);
	private algorithm: string = <string> process.env.algorithm;
	private secret: string = <string> process.env.cipher_secret;
	private key: string = createHash('sha256')
		.update(this.secret, this.inputEncoding)
		.digest(this.outputEncoding)
		.slice(0, 32);
	private salt: Buffer = scryptSync(this.secret, 'salt', 16);
	
	constructor() {
	}
	
	public encrypt(data: string): string {
		const cipher: Cipher = createCipheriv(this.algorithm, this.key, this.salt);
		const encryptedData: string = cipher.update(data, this.inputEncoding, this.outputEncoding)
			+ cipher.final(this.outputEncoding);
		
		return encryptedData;
	}
	
	public decrypt(data: string, salt: string): string {
		const decipher: Cipher = createDecipheriv(this.algorithm, this.key, Buffer.from(salt, this.outputEncoding));
		const decryptedData: string = decipher.update(data, this.outputEncoding, this.inputEncoding)
			+ decipher.final(this.inputEncoding);
		
		return decryptedData;
	}
	
	public getSalt(): string {
		return this.salt.toString(this.outputEncoding);
	}
}

export default CipherModule;
