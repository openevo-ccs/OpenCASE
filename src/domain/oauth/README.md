# OAuth Service

A minimal OAuth 2.0 service for issuing JWTs using the client credentials flow.

## Features

- **Client Credentials Flow**: Service-to-service authentication
- **JWT Tokens**: RS256 signed tokens with configurable expiration
- **File-based Client Management**: Simple JSON file for client configuration
- **Automatic Key Generation**: RSA key pairs generated automatically on first run
- **OAuth2 Discovery**: Basic discovery endpoint for client configuration

## Endpoints

### POST /oauth/token

Issues an access token using client credentials.

**Request** (form-encoded or JSON):
```
grant_type=client_credentials
client_id=demo-client
client_secret=demo-secret
scope=case.read case.write
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "case.read case.write"
}
```

### GET /.well-known/oauth-authorization-server

OAuth2 discovery endpoint.

**Response**:
```json
{
  "issuer": "opencase-oauth",
  "token_endpoint": "/oauth/token",
  "grant_types_supported": ["client_credentials"],
  "token_endpoint_auth_methods_supported": ["client_secret_post", "client_secret_basic"]
}
```

## Client Configuration

Clients are stored in `data/oauth/clients.json` (configurable via `OAUTH_CLIENTS_FILE`).

**Example**:
```json
[
  {
    "clientId": "demo-client",
    "clientSecret": "demo-secret",
    "tenantId": "demo",
    "grantTypes": ["client_credentials"],
    "scopes": ["case.read", "case.write"],
    "active": true
  }
]
```

## Environment Variables

- `OAUTH_KEY_DIR`: Directory for RSA keys (default: `data/oauth/keys`)
- `OAUTH_CLIENTS_FILE`: Path to clients JSON file (default: `data/oauth/clients.json`)
- `OAUTH_ISSUER`: Token issuer claim (default: `opencase-oauth`)

## Usage Example

```bash
# Get an access token
curl -X POST http://localhost:8080/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=demo-client" \
  -d "client_secret=demo-secret" \
  -d "scope=case.read case.write"

# Use the token to access protected endpoints
curl -X GET http://localhost:8080/ims/case/v1p1/CFPackages/doc-123 \
  -H "Authorization: Bearer <access_token>"
```

## Architecture

The OAuth service follows DDD principles:

- **Domain**: `OAuthClient`, `AccessToken` entities
- **Application**: `IssueToken` command handler
- **Infrastructure**: `JwtSignerImpl`, `KeyManager`, `FileOAuthClientRepository`
- **Interfaces**: HTTP controllers and routes

## Security Notes

- RSA 2048-bit keys are generated automatically
- Keys are stored in the configured directory (not in git)
- Client secrets should be kept secure
- Tokens expire after 1 hour by default
- Only client_credentials grant type is supported


