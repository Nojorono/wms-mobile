export interface OutboundItemParam {
  item: OutboundItem;
}

// =============================
// DO (Delivery Order)
// =============================
export interface DO {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  outbound_do_number: string;
  expedition: string;
  origin: string;
  license_plate: string;
  driver_name: string;
  driver_phone: string;
  status: string;
  outbound_type: string;
  delivery_date: string;
  memo_id: string[];
  memo_sequence: string[];
}

// =============================
// MEMO
// =============================
export interface Memo {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  requestor: string;
  origin: string;
  ship_to: string;
  destination: string;
  delivery_date: string;
  status: string;
  notes: string;
  has_do: boolean;
}

// =============================
// ITEM (SKU)
// =============================
export interface ItemDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sku: string;
  item_number: string;
  description: string;
  inventory_item_id: string;
  dus_per_stack: number | null;
  bal_per_dus: number | null;
  press_per_bal: number | null;
  bks_per_press: number | null;
  btg_per_bks: number | null;
  organization_id: number | null;
}

// =============================
// WAREHOUSE SUB
// =============================
export interface WarehouseSub {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  organization_id: number;
  warehouse_id: string;
  name: string;
  code: string;
  description: string;
  capacity_bin: number | null;
  barcode_image_url: string;
  is_staging: string;
}

// =============================
// BIN (Warehouse Bin)
// =============================
export interface WarehouseBin {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  organization_id: number;
  warehouse_sub_id: string;
  name: string;
  code: string;
  description: string;
  capacity_pallet: number;
  barcode_image_url: string;
  current_pallet: number | null;
}

// =============================
// TRANSACTION SCAN PICKING
// =============================
export interface TransactionScanPicking {
  // tambahkan tipe detail jika kamu tau struktur datanya
}

// =============================
// MAIN OUTBOUND ITEM
// =============================
export interface OutboundItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  do_id: string;
  do: DO;

  memo_id: string;
  memo: Memo;

  item_id: string;
  item: ItemDetail;

  source_warehouse_sub_id: string | null;
  sourceWarehouseSub: WarehouseSub | null;

  source_bin_id: string | null;
  sourceBin: WarehouseBin | null;

  destination_warehouse_sub_id: string | null;
  destinationWarehouseSub: WarehouseSub | null;

  destination_bin_id: string | null;
  destinationBin: WarehouseBin | null;

  quantity: number;
  uom: string;
  week_number: number;
  status: string;

  transactionScanPicking: TransactionScanPicking[];
}
