import { BaseDescriptor } from "error-handling/error-core";

export interface ErrorRegistryInterface<C extends string> {
  readonly name: string; // `${Service}_${Kind}`
  readonly service: string; // constant within the registry
  readonly byCode: Readonly<{ [K in C]: BaseDescriptor<K> }>;
  readonly codes: Readonly<{ [K in C]: K }>; // enum-like object of literal codes
  readonly list: ReadonlyArray<BaseDescriptor<C>>; // original array (frozen)
}

