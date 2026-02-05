import type { Command } from '@/application/shared/CommandBus'
import type { FrameworkId, ItemId } from '@/domain/shared/types'

export type UpdateItem = Command<
  'framework/updateItem',
  {
    frameworkId: FrameworkId
    itemId: ItemId
    patch: Partial<{
      statement: string
    }>
  }
>

