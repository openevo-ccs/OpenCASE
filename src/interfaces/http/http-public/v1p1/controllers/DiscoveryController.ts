import type { Request, Response, RequestHandler } from 'express'
import { OpenAPISpecGenerator } from '../../../../../infrastructure/http/OpenAPISpecGenerator'
import { getBaseUrl } from '../utils/httpUtils'

export class DiscoveryControllerV1p1 {
  getOpenAPISpec: RequestHandler = (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req)

    // Generate OpenAPI spec
    const spec = OpenAPISpecGenerator.generateV1p1({
      baseUrl,
      version: '1.0.0'
    })

    // Set appropriate content type
    res.setHeader('Content-Type', 'application/json')
    res.json(spec)
  }
}
