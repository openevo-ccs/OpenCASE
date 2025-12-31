export interface JwtSigner {
  sign(payload: Record<string, unknown>, expiresInSeconds: number): string;
}


