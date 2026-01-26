import type { Command } from '@/application/shared/CommandBus'
import type { FrameworkId, ItemId } from '@/domain/shared/types'

export type RemoveItem = Command<
  'framework/removeItem',
  {
    frameworkId: FrameworkId
    itemId: ItemId
  }
>

