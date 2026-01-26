export type Command<TType extends string, TPayload> = {
  type: TType
  payload: TPayload
}

export type CommandHandler<TCommand extends Command<string, unknown>> = (_command: TCommand) => Promise<void>

export interface CommandBus {
  dispatch<TCommand extends Command<string, unknown>>(_command: TCommand): Promise<void>
}

