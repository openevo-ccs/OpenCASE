import type { Command } from '@/application/shared/CommandBus'
import type { AssociationId, FrameworkId, ItemId } from '@/domain/shared/types'
import type { AssociationType } from '@/domain/framework/model/types'

export type AddAssociation = Command<
  'framework/addAssociation',
  {
    frameworkId: FrameworkId
    associationId: AssociationId
    fromItemId: ItemId
    toItemId: ItemId
    associationType: AssociationType
  }
>

