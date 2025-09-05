export const extractStrEnvWithFallback = (
  env: any,
  fallback: string,
): string => (env == null || env === '' ? fallback : env);
