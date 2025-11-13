// typesSubscribe.ts

// ======================
// 📦 Notification Types
// ======================

export const NotificationTypes = {
  // Inbound
  INBOUND_CREATED: 'INBOUND_CREATED',
  INBOUND_UPDATED: 'INBOUND_UPDATED',
  INBOUND_STATUS_CHANGED: 'INBOUND_STATUS_CHANGED',
  INBOUND_DO_VALIDATED: 'INBOUND_DO_VALIDATED',
  INBOUND_INSPECTION_READY: 'INBOUND_INSPECTION_READY',
  INBOUND_INSPECTION_APPROVED: 'INBOUND_INSPECTION_APPROVED',

  // Scan Inbound
  SCAN_INBOUND_COMPLETED: 'SCAN_INBOUND_COMPLETED',
  SCAN_INBOUND_PENDING: 'SCAN_INBOUND_PENDING',

  // Put Away
  PUT_AWAY_ASSIGNED: 'PUT_AWAY_ASSIGNED',
  PUT_AWAY_COMPLETED: 'PUT_AWAY_COMPLETED',
  PUT_AWAY_IN_PROGRESS: 'PUT_AWAY_IN_PROGRESS',

  // Inventory
  INVENTORY_UPDATED: 'INVENTORY_UPDATED',
  INVENTORY_LOW_STOCK: 'INVENTORY_LOW_STOCK',
  INVENTORY_LOCATION_CHANGED: 'INVENTORY_LOCATION_CHANGED',

  // Outbound Memo
  OUTBOUND_MEMO_CREATED: 'OUTBOUND_MEMO_CREATED',
  OUTBOUND_MEMO_APPROVED: 'OUTBOUND_MEMO_APPROVED',
  OUTBOUND_MEMO_REJECTED: 'OUTBOUND_MEMO_REJECTED',
  OUTBOUND_MEMO_COMPLETED: 'OUTBOUND_MEMO_COMPLETED',

  // Outbound DO
  OUTBOUND_DO_CREATED: 'OUTBOUND_DO_CREATED',
  OUTBOUND_DO_UPDATED: 'OUTBOUND_DO_UPDATED',
  OUTBOUND_DO_STATUS_CHANGED: 'OUTBOUND_DO_STATUS_CHANGED',
  OUTBOUND_DO_READY: 'OUTBOUND_DO_READY',

  // Picking
  PICKING_ASSIGNED: 'PICKING_ASSIGNED',
  PICKING_STARTED: 'PICKING_STARTED',
  PICKING_COMPLETED: 'PICKING_COMPLETED',
  PICKING_SUGGESTION_READY: 'PICKING_SUGGESTION_READY',

  // Scan Picking
  SCAN_PICKING_COMPLETED: 'SCAN_PICKING_COMPLETED',
  SCAN_PICKING_INSPECTION_READY: 'SCAN_PICKING_INSPECTION_READY',

  // Pallet
  PALLET_QUANTITY_UPDATED: 'PALLET_QUANTITY_UPDATED',
  PALLET_FULL: 'PALLET_FULL',
  PALLET_EMPTY: 'PALLET_EMPTY',
  PALLET_MOVED: 'PALLET_MOVED',

  // System
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SYSTEM_WARNING: 'SYSTEM_WARNING',
  SYSTEM_INFO: 'SYSTEM_INFO',
} as const;

// 🔒 Type inference agar semua value jadi union string type
export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

// ======================
// 🔔 Subscribe Helpers
// ======================

/**
 * Subscribe ke list tipe notifikasi tertentu.
 */
export const subscribeToNotifications = (
  socket: any,
  types: NotificationType[]
) => {
  socket.emit('subscribe', { types });
};

/**
 * Subscribe ke semua notifikasi.
 */
export const subscribeAll = (socket: any) => {
  subscribeToNotifications(socket, Object.values(NotificationTypes));
};

// ======================
// ✅ Example Usage
// ======================
//
// import { subscribeToNotifications, NotificationTypes } from './typesSubscribe';
//
// subscribeToNotifications(socket, [
//   NotificationTypes.INBOUND_INSPECTION_READY,
//   NotificationTypes.OUTBOUND_DO_READY,
// ]);
//
// Atau untuk semua:
// subscribeAll(socket);
//
