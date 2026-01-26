export type HttpClient = {
  get: (_url: string) => Promise<unknown>
  post: (_url: string, _body: unknown) => Promise<unknown>
  put: (_url: string, _body: unknown) => Promise<unknown>
  delete: (_url: string) => Promise<unknown>
}

export function createFetchHttpClient(_baseUrl: string): HttpClient {
  // Placeholder: implement real fetch client later.
  throw new Error('Not implemented')
}

