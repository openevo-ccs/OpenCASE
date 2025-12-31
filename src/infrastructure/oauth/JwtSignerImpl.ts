import jwt from 'jsonwebtoken';
import { JwtSigner } from '../../application/oauth/ports/JwtSigner';

export interface JwtSignerConfig {
  privateKey: string;
  issuer: string;
  algorithm: 'RS256' | 'HS256';
}

export class JwtSignerImpl implements JwtSigner {
  constructor(private readonly cfg: JwtSignerConfig) {}

  sign(payload: Record<string, unknown>, expiresInSeconds: number): string {
    return jwt.sign(payload, this.cfg.privateKey, {
      algorithm: this.cfg.algorithm,
      issuer: this.cfg.issuer,
      expiresIn: expiresInSeconds
    });
  }
}


