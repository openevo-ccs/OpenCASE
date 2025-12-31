import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export class KeyManager {
  constructor(private readonly keyDir: string) {}

  async ensureKeys(): Promise<KeyPair> {
    const privateKeyPath = path.join(this.keyDir, 'private.pem');
    const publicKeyPath = path.join(this.keyDir, 'public.pem');

    try {
      // Try to load existing keys
      const [privateKey, publicKey] = await Promise.all([
        fs.readFile(privateKeyPath, 'utf8'),
        fs.readFile(publicKeyPath, 'utf8')
      ]);

      return { privateKey, publicKey };
    } catch {
      // Generate new keys if they don't exist
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      // Ensure directory exists
      await fs.mkdir(this.keyDir, { recursive: true });

      // Save keys
      await Promise.all([
        fs.writeFile(privateKeyPath, privateKey, 'utf8'),
        fs.writeFile(publicKeyPath, publicKey, 'utf8')
      ]);

      return { privateKey, publicKey };
    }
  }

  async getPublicKey(): Promise<string> {
    const publicKeyPath = path.join(this.keyDir, 'public.pem');
    return await fs.readFile(publicKeyPath, 'utf8');
  }

  async getPrivateKey(): Promise<string> {
    const privateKeyPath = path.join(this.keyDir, 'private.pem');
    return await fs.readFile(privateKeyPath, 'utf8');
  }
}


