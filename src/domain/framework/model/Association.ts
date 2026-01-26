import type { Association, AssociationType } from './types'
import type { AssociationId, ItemId } from '@/domain/shared/types'

export function createAssociation(params: {
  id: AssociationId
  fromItemId: ItemId
  toItemId: ItemId
  associationType: AssociationType
}): Association {
  return {
    id: params.id,
    fromItemId: params.fromItemId,
    toItemId: params.toItemId,
    associationType: params.associationType,
  }
}

