import type { Command } from '@/application/shared/CommandBus'
import type { FrameworkId } from '@/domain/shared/types'

export type PublishFramework = Command<
  'framework/publish',
  {
    frameworkId: FrameworkId
  }
>

