export type CaseVersion = '1.0' | '1.1' | 'unknown'

/**
 * Version-agnostic snapshot of a CASE CFDocument.
 *
 * Combines fields from both v1p0 and v1p1 specifications.
 */
export type CaseDocumentSnapshot = {
  identifier: string
  uri?: string
  title?: string
  creator?: string
  description?: string
  /** v1p1: Framework type classification */
  frameworkType?: string
  /** Status in adoption lifecycle */
  adoptionStatus?: string
  /** Explicit CASE version (v1p1 field) */
  caseVersion?: string
  /** Document language (e.g., "en") */
  language?: string
  /** Document version string */
  version?: string
  lastChangeDateTime?: string
}

/**
 * Version-agnostic snapshot of a CASE CFItem.
 *
 * Combines fields from both v1p0 and v1p1 specifications.
 */
export type CaseItemSnapshot = {
  identifier: string
  uri?: string
  fullStatement: string
  abbreviatedStatement?: string
  alternativeLabel?: string
  humanCodingScheme?: string
  /** Item type (derived from CFItemType string or CFItemTypeURI) */
  CFItemType?: string
  /**
   * v1p0: List enumeration for ordering.
   * Used when items need to maintain a specific sequence.
   */
  listEnumeration?: string
  subject?: string[]
  educationLevel?: string[]
  conceptKeywords?: string[]
  notes?: string
  /** Item language (e.g., "en") */
  language?: string
  lastChangeDateTime?: string
  extensions?: Record<string, unknown>
}

/**
 * Version-agnostic snapshot of a CASE CFAssociation.
 *
 * Combines fields from both v1p0 and v1p1 specifications.
 */
export type CaseAssociationSnapshot = {
  identifier: string
  associationType?: string
  originIdentifier?: string
  destinationIdentifier?: string
  originUri?: string
  destinationUri?: string
  /**
   * v1p1: Sequence number for ordering associations.
   * Lower numbers appear first in ordered contexts.
   */
  sequenceNumber?: number
  lastChangeDateTime?: string
  extensions?: Record<string, unknown>
}

/**
 * Version-agnostic snapshot of a CASE CFPackage "graph".
 *
 * This is intentionally minimal: just enough data to hydrate editor graphs and/or
 * map into the domain `Framework` without tying UI code to CASE v1p0/v1p1 nuances.
 *
 * The normalization process handles:
 * - Different identifier fields (sourcedId vs identifier)
 * - Different link formats (plain URI vs LinkGenURI object)
 * - Different array wrappers (CFItemSet vs CFItems)
 * - Different type specifications (CFItemTypeURI vs CFItemType)
 */
export type CasePackageSnapshot = {
  /** Detected or explicit CASE version */
  version: CaseVersion
  /** The framework document metadata */
  document: CaseDocumentSnapshot
  /** All items (competencies, standards, etc.) in the package */
  items: CaseItemSnapshot[]
  /** All associations (relationships) between items */
  associations: CaseAssociationSnapshot[]
}
