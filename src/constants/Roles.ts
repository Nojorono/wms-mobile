export const ROLES = {
  DRIVER_FORKLIFT: "DRIVER_FORKLIFT",
  WH_STAFF: "WH_STAFF",
  HELPER: "HELPER",
  SUPERVISOR: "SUPERVISOR",
  ADMIN: "ADMIN",
  DRIVER: "DRIVER",
} as const;

// optional: array versi list untuk looping atau validasi
export const ROLE_LIST = Object.values(ROLES);