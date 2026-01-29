import type { CFPackageRepository } from '../ports/CFPackageRepository';
import { CaseVersion, TenantId } from '../../../domain/case/value-objects/Identifiers';
import { CFDocument } from '../../../domain/case/entities/CFDocument';
import { CFItem } from '../../../domain/case/entities/CFItem';
import { CFAssociation } from '../../../domain/case/entities/CFAssociation';
import { CFPackage } from '../../../domain/case/entities/CFPackage';
import { JsonSchemaValidator } from '../../../infrastructure/validation/JsonSchemaValidator';

export interface CreateFrameworkCommand {
  tenantId: TenantId;
  caseVersion: CaseVersion;
  payload: {
    document: any;
    items?: any[];
    associations?: any[];
    rubrics?: any[];
    definitions?: any;
  };
}

export class CreateFramework {
  constructor(
    private readonly pkgRepo: CFPackageRepository,
    private readonly validator?: JsonSchemaValidator
  ) {}

  async execute(cmd: CreateFrameworkCommand): Promise<void> {
    const { tenantId, caseVersion, payload } = cmd;

    // Validate against JSON schema if validator is available
    if (this.validator) {
      try {
        const schemaName = caseVersion === '1.1' ? 'case-v1p1-cfpackage' : 'case-v1p0-cfpackage'
        this.validator.validate(schemaName, payload)
      } catch (error: any) {
        throw new Error(`Schema validation failed: ${error.message}`)
      }
    }

    const document = CFDocument.fromRaw(tenantId, caseVersion, payload.document);
    const docId = document.sourcedId;
    const docJSON = document.toJSON();
    const docURI = docJSON.uri;
    
    const items = (payload.items ?? []).map(i => 
      CFItem.fromRaw(tenantId, caseVersion, i, docId, docURI)
    );
    const associations = (payload.associations ?? []).map(a =>
      CFAssociation.fromRaw(tenantId, caseVersion, a)
    );
    const rubrics = payload.rubrics ?? [];
    const definitions = payload.definitions ?? null;

    const pkg = new CFPackage({ document, items, associations, rubrics, definitions });

    await this.pkgRepo.saveNewVersion(tenantId, caseVersion, pkg);
  }
}

