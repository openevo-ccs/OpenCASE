export interface AccessTokenProps {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
}

export class AccessToken {
  private constructor(private readonly props: AccessTokenProps) {}

  static create(props: AccessTokenProps): AccessToken {
    if (!props.accessToken) throw new Error('AccessToken.accessToken is required');
    if (!props.tokenType) throw new Error('AccessToken.tokenType is required');
    if (props.expiresIn <= 0) throw new Error('AccessToken.expiresIn must be positive');
    return new AccessToken(props);
  }

  get accessToken(): string { return this.props.accessToken; }
  get tokenType(): string { return this.props.tokenType; }
  get expiresIn(): number { return this.props.expiresIn; }
  get scope(): string | undefined { return this.props.scope; }

  toJSON() {
    const result: any = {
      access_token: this.props.accessToken,
      token_type: this.props.tokenType,
      expires_in: this.props.expiresIn
    };
    if (this.props.scope) {
      result.scope = this.props.scope;
    }
    return result;
  }
}


