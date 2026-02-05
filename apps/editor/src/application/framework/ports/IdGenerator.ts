import type { AssociationId, FrameworkId, ItemId } from '@/domain/shared/types'

export interface IdGenerator {
  newFrameworkId(): FrameworkId
  newItemId(): ItemId
  newAssociationId(): AssociationId
}

