export const extractBoolEnv = (value: any, def = false) =>
  value == null ? def : `${value}`.toLowerCase() === 'true';
