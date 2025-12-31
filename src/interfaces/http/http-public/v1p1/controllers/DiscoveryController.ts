import type { Request, Response, RequestHandler } from 'express'
import { OpenAPISpecGenerator } from '../../../../../infrastructure/http/OpenAPISpecGenerator'

export class DiscoveryControllerV1p1 {
  getOpenAPISpec: RequestHandler = (req: Request, res: Response) => {
    // Determine base URL from request
    const protocol = req.protocol
    const host = req.get('host') || 'localhost:8080'
    const baseUrl = `${protocol}://${host}`

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
