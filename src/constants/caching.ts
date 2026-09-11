export const CACHE_TTL = {
  ZERO: 0,
  FRESH: 60, // 1 minute
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
} as const
