export const extractStrEnvWithFallback = (v: any, d: any) =>
  v == null || v === '' ? d : v;
