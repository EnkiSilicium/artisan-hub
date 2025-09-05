export interface BaseEvent<N extends string> {
  eventName: N;
  schemaV: number;
}
