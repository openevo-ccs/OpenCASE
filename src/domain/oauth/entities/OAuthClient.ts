export interface OAuthClientProps {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  grantTypes: string[];
  scopes?: string[];
  active: boolean;
}

export class OAuthClient {
  private constructor(private readonly props: OAuthClientProps) {}

  static create(props: OAuthClientProps): OAuthClient {
    if (!props.clientId) throw new Error('OAuthClient.clientId is required');
    if (!props.clientSecret) throw new Error('OAuthClient.clientSecret is required');
    if (!props.tenantId) throw new Error('OAuthClient.tenantId is required');
    if (!props.grantTypes || props.grantTypes.length === 0) {
      throw new Error('OAuthClient.grantTypes is required');
    }
    return new OAuthClient(props);
  }

  get clientId(): string { return this.props.clientId; }
  get clientSecret(): string { return this.props.clientSecret; }
  get tenantId(): string { return this.props.tenantId; }
  get grantTypes(): string[] { return [...this.props.grantTypes]; }
  get scopes(): string[] { return this.props.scopes ?? []; }
  get active(): boolean { return this.props.active; }

  validateSecret(secret: string): boolean {
    return this.props.clientSecret === secret;
  }

  supportsGrantType(grantType: string): boolean {
    return this.props.grantTypes.includes(grantType);
  }

  hasScope(scope: string): boolean {
    return this.props.scopes?.includes(scope) ?? false;
  }
}


