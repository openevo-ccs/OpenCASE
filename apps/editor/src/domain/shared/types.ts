export type Brand<K, T extends string> = K & { readonly __brand: T }

export type FrameworkId = Brand<string, 'FrameworkId'>
export type ItemId = Brand<string, 'ItemId'>
export type AssociationId = Brand<string, 'AssociationId'>

