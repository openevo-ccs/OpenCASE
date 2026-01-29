import type { Request, Response, RequestHandler } from 'express'
import { OpenAPISpecGenerator } from '../../../../../infrastructure/http/OpenAPISpecGenerator'
import { getBaseUrl } from '../utils/httpUtils'

export class DiscoveryControllerV1p0 {
  getOpenAPISpec: RequestHandler = (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req)
    const spec = OpenAPISpecGenerator.generateV1p0({
      baseUrl,
      version: '1.0.0'
    })
    res.setHeader('Content-Type', 'application/json')
    res.json(spec)
  }
}

