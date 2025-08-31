export const extractBoolEnv = (v: any, d = false) =>
  v == null ? d : `${v}`.toLowerCase() === 'true';
