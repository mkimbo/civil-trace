export const ALERT_CATEGORIES = {
  MISSING_PERSON: 'missing-person',
  LOST_VEHICLE: 'lost-vehicle',
  LOST_MOTORBIKE: 'lost-motorbike',
} as const

export type AlertCategory = (typeof ALERT_CATEGORIES)[keyof typeof ALERT_CATEGORIES]
