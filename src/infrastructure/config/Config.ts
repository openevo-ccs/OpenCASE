export interface AppConfig {
  httpPort: number;
  caseDataDir: string;
  jwtPublicKey: string;
  jwtIssuer: string;
  jwtAudience: string;
  oauthKeyDir: string;
  oauthClientsFile: string;
  oauthIssuer: string;
}

export function loadConfig(): AppConfig {
  return {
    httpPort: Number(process.env.PORT ?? 8080),
    caseDataDir: process.env.CASE_DATA_DIR ?? 'data',
    jwtPublicKey: process.env.JWT_PUBLIC_KEY ?? 'changeme',
    jwtIssuer: process.env.JWT_ISSUER ?? 'example-issuer',
    jwtAudience: process.env.JWT_AUDIENCE ?? 'example-audience',
    oauthKeyDir: process.env.OAUTH_KEY_DIR ?? 'data/oauth/keys',
    oauthClientsFile: process.env.OAUTH_CLIENTS_FILE ?? 'data/oauth/clients.json',
    oauthIssuer: process.env.OAUTH_ISSUER ?? 'opencase-oauth'
  };
}

