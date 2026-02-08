import type { AssociationId, FrameworkId, ItemId } from '@/domain/shared/types'

export type FrameworkStatus = 'Draft' | 'Published'

export type ItemType = 'Standard' | 'LearningOutcome' | 'Competency' | 'Skill'

export type AssociationType = 'isChildOf' | 'isPartOf' | 'isRelatedTo'

export type FrameworkMetadata = {
  title?: string
  description?: string
  creator?: string
  frameworkType?: string
  adoptionStatus?: string
  caseVersion?: string
  version?: string
  lastChangeDateTime?: string
  /** CASE licenseURI — link to the CFLicense governing this framework */
  licenseURI?: { title?: string; identifier?: string; uri: string }
}

export type ItemMetadata = Record<string, unknown>
export type AssociationMetadata = Record<string, unknown>

export type Item = {
  id: ItemId
  statement: string
  type: ItemType
  metadata?: ItemMetadata
}

export type Association = {
  id: AssociationId
  fromItemId: ItemId
  toItemId: ItemId
  associationType: AssociationType
  metadata?: AssociationMetadata
}

export type Framework = {
  id: FrameworkId
  metadata: FrameworkMetadata
  items: Map<ItemId, Item>
  associations: Map<AssociationId, Association>
  status: FrameworkStatus
}

