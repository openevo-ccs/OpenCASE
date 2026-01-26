import type { Command } from '@/application/shared/CommandBus'
import type { AssociationId, FrameworkId } from '@/domain/shared/types'

export type RemoveAssociation = Command<
  'framework/removeAssociation',
  {
    frameworkId: FrameworkId
    associationId: AssociationId
  }
>

