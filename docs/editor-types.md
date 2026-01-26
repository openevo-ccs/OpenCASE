According to a document from **January 12, 2025**, the CASE 1.1 info model + REST/JSON binding define the core entities you’ll want to type in TypeScript: **CFPackage**, **CFDocument**, **CFItem**, **CFAssociation**, plus the **CFDefinitions** bundles (subjects, concepts, licenses, item types, association groupings). The binding also adds CASE 1.1-specific fields like `frameworkType`, `caseVersion`, `extensions`, and association `targetType`.

Below is a **practical, editor-friendly** set of TS types (DTO-style) that matches the CASE JSON shapes you’ll exchange with your backend.

```ts
/**
 * CASE 1.1 TypeScript DTOs (JSON shapes)
 * Sources: CASE 1.1 Information Model + REST/JSON Binding.
 *
 * Notes:
 * - Many fields are optional in the spec; required fields are marked where the binding indicates them.
 * - "extensions" is allowed on CFDocument/CFItem/CFAssociation in CASE 1.1. 
 * - CFAssociation origin/destination Node URIs are LinkGenURI with optional targetType in 1.1. 
 */

export type UUID = string; // pattern constrained in JSON schema; keep as string in TS.
export type URI = string;  // uri format in JSON schema

/** LinkURI shape appears throughout: { title, identifier, uri } */
export interface LinkURI {
  title?: string;
  identifier?: string;
  uri: URI;
}

/**
 * CASE 1.1: originNodeURI / destinationNodeURI allow "targetType" to indicate non-CASE targets.
 * Default is CASE; treated as open vocabulary.
 */
export interface LinkGenURI extends LinkURI {
  targetType?: CFAssociationTargetType;
}

/** Open vocabulary (the spec notes default "CASE" and open set) */
export type CFAssociationTargetType = "CASE" | `ext:${string}` | string;

/** Extensions are explicitly allowed in CASE 1.1 for multiple entities. */
export type CaseExtensions = Record<string, unknown>;

/** ========== Core package container ========== */

/**
 * CFPackage: root container for a framework document + items + associations + definitions + rubrics.
 * 
 */
export interface CFPackage {
  CFDocument: CFDocument;
  CFItems?: CFItem[];
  CFAssociations?: CFAssociation[];
  CFDefinitions?: CFDefinition;
  CFRubrics?: CFRubric[];
  extensions?: CaseExtensions;
}

/** ========== CFDocument (framework) ========== */

/**
 * Binding indicates CFDocument required fields include:
 * identifier, uri, creator, title, lastChangeDateTime, CFPackageURI.
 * Also new in 1.1: frameworkType, caseVersion.
 * 
 */
export interface CFDocument {
  identifier: UUID;
  uri: URI;

  /** "creator" is required per binding; typically a string name/org */
  creator: string;

  title: string;

  /** 1.1 additions */
  frameworkType?: string; // optional; course codes mentioned as official type in 1.1 text.
  caseVersion?: "1.1" | string; // spec expects 1.1 currently.

  /** Common optional metadata */
  description?: string;
  notes?: string; // may contain Markdown/LaTeX per 1.1 best practice.
  language?: string; // language code
  version?: string;
  adoptionStatus?: string;

  /** lifecycle */
  statusStartDate?: string; // Date (string in binding)
  statusEndDate?: string;   // Date (string in binding)

  /** licensing */
  licenseURI?: LinkURI;

  lastChangeDateTime: string; // date-time

  /** Link back to containing package */
  CFPackageURI: LinkURI;

  extensions?: CaseExtensions;
}

/** ========== CFItem (node) ========== */

/**
 * CFItem attributes listed in info model / package item definition.
 * Required (in package context): identifier, fullStatement, uri, lastChangeDateTime.
 * Also includes CFDocumentURI link when exchanged outside package.
 * 
 */
export interface CFItem {
  identifier: UUID;
  uri: URI;

  /** Required in package item container */
  fullStatement: string; // supports Markdown/LaTeX in 1.1.

  alternativeLabel?: string;
  CFItemType?: string; // NormalizedString
  CFItemTypeURI?: LinkURI;

  humanCodingScheme?: string;
  listEnumeration?: string;
  abbreviatedStatement?: string;

  conceptKeywords?: string[];
  conceptKeywordsURI?: LinkURI;

  notes?: string; // supports Markdown/LaTeX in 1.1.

  /** 1.1: subject / subjectURI can vary per item (not only per document). */
  subject?: string[];
  subjectURI?: LinkURI[];

  language?: string;
  educationLevel?: string[];

  licenseURI?: LinkURI;
  statusStartDate?: string; // Date
  statusEndDate?: string;   // Date

  lastChangeDateTime: string; // DateTime

  /**
   * When CFItem is exchanged outside CFPackage, it includes CFDocumentURI.
   * Some APIs include it in package too; keep optional to be tolerant.
   * 
   */
  CFDocumentURI?: LinkURI;

  extensions?: CaseExtensions;
}

/** ========== CFAssociation (edge) ========== */

/**
 * CFAssociation core fields:
 * identifier, associationType, uri, originNodeURI, destinationNodeURI, lastChangeDateTime
 * plus optional notes, grouping, sequenceNumber, extensions.
 * origin/destination are LinkGenURI (with optional targetType in 1.1).
 * 
 */
export interface CFAssociation {
  identifier: UUID;

  associationType: CFAssociationType; // extensible enum union
  uri: URI;

  originNodeURI: LinkGenURI;
  destinationNodeURI: LinkGenURI;

  sequenceNumber?: number;

  CFAssociationGroupingURI?: LinkURI;

  lastChangeDateTime: string; // date-time

  /** Added/clarified in 1.1 and supports Markdown/LaTeX per best practice */
  notes?: string; // 

  /**
   * In some binding snippets, CFDocumentURI appears on association dtype.
   * Keep optional to align with API payloads.
   * 
   */
  CFDocumentURI?: LinkURI;

  extensions?: CaseExtensions;
}

/**
 * The binding shows associationType as:
 * - oneOf enum values like isChildOf, isPeerOf, isPartOf, exactMatchOf, precedes, isRelatedTo, ...
 * - OR an extension pattern "ext:..." (extensible enum)
 * 
 *
 * Also CASE 1.1 adds "isTranslationOf".
 * 
 */
export type CFAssociationType =
  | "isChildOf"
  | "isPeerOf"
  | "isPartOf"
  | "exactMatchOf"
  | "precedes"
  | "isRelatedTo"
  | "isTranslationOf"
  | `ext:${string}`
  | string;

/** ========== CFDefinitions (lookup sets) ========== */

/**
 * CFDefinition contains the sets: CFConcepts, CFSubjects, CFLicenses, CFItemTypes, CFAssociationGroupings.
 * 
 */
export interface CFDefinition {
  CFConcepts?: CFConcept[];
  CFSubjects?: CFSubject[];
  CFLicenses?: CFLicense[];
  CFItemTypes?: CFItemType[];
  CFAssociationGroupings?: CFAssociationGrouping[];
  extensions?: CaseExtensions;
}

/** Shapes below are typical CASE link-like definition objects. Keep them minimal and tolerant. */
export interface CFConcept {
  identifier: UUID;
  uri: URI;
  title?: string;
  description?: string;
  hierarchyCode?: string;
  keywords?: string[];
  extensions?: CaseExtensions;
}

export interface CFSubject {
  identifier: UUID;
  uri: URI;
  title?: string;
  description?: string;
  hierarchyCode?: string;
  extensions?: CaseExtensions;
}

export interface CFLicense {
  identifier: UUID;
  uri: URI;
  title?: string;
  description?: string;
  licenseText?: string;
  extensions?: CaseExtensions;
}

export interface CFItemType {
  identifier: UUID;
  uri: URI;
  title?: string;
  description?: string;
  hierarchyCode?: string;
  extensions?: CaseExtensions;
}

export interface CFAssociationGrouping {
  identifier: UUID;
  uri: URI;
  title?: string;
  description?: string;
  extensions?: CaseExtensions;
}

/** Rubrics exist in CFPackage; keep as placeholder until you decide to author them in-app.  */
export interface CFRubric {
  identifier: UUID;
  uri: URI;
  title?: string;
  description?: string;
  extensions?: CaseExtensions;
}
```

### Why these types are “editor-ready”

* They match the **package container** model (CFPackage includes CFDocument/Items/Associations/Definitions).
* They include CASE 1.1 additions you’ll hit immediately in the editor:

  * `CFDocument.frameworkType`, `CFDocument.caseVersion`
  * `CFItem.subject` / `subjectURI` (item-level variance)
  * `CFAssociation.notes` and association node `targetType` (non-CASE targets)
  * `extensions` everywhere CASE 1.1 allows it

