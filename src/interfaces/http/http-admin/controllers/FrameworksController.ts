import { Request, Response } from 'express'
import { CreateFramework } from '../../../../application/case/endpoints/CreateFramework'
import { ImportFrameworkFromEndpoint } from '../../../../application/case/endpoints/ImportFrameworkFromEndpoint'

export class FrameworksController {
  constructor(
    private readonly createFramework: CreateFramework,
    private readonly importFramework: ImportFrameworkFromEndpoint
  ) {}

  create = async (req: Request, res: Response) => {
    const tenantId = req.params.tenantId
    const caseVersion = (req.query.caseVersion as '1.0' | '1.1') ?? '1.1'

    // TODO: validate req.body against CASE JSON Schema via JsonSchemaValidator

    await this.createFramework.execute({
      tenantId,
      caseVersion,
      payload: req.body
    })

    res.status(201).json({ status: 'created' })
  }

  importFromEndpoint = async (req: Request, res: Response) => {
    const tenantId = req.params.tenantId
    const caseVersion = (req.query.caseVersion as '1.0' | '1.1') ?? '1.1'
    const { endpointUrl, accessToken, validateSchema, schemaName } = req.body

    if (!endpointUrl) {
      return res.status(400).json({ error: 'endpointUrl is required' })
    }

    try {
      const result = await this.importFramework.execute({
        tenantId,
        caseVersion,
        endpointUrl,
        accessToken,
        validateSchema: validateSchema ?? false,
        schemaName
      })

      res.status(201).json({
        status: 'imported',
        docId: result.docId,
        version: result.version
      })
    } catch (error: any) {
      res.status(400).json({
        error: 'import_failed',
        message: error.message
      })
    }
  }
}
