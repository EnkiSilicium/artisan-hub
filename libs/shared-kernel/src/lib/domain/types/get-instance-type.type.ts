export type GetInstanceType<C> = C extends new (...args: any[]) => infer R
  ? R
  : never;
