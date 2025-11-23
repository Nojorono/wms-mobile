export interface PickingMemoRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  do_id: string;
  do: DoDetail;

  memo_id: string;
  memo: MemoDetail;

  item_id: string;
  item: ItemDetail;

  source_warehouse_sub_id: string | null;
  sourceWarehouseSub: WarehouseSub | null;

  source_bin_id: string | null;
  sourceBin: BinDetail | null;

  destination_warehouse_sub_id: string | null;
  destinationWarehouseSub: WarehouseSub | null;

  destination_bin_id: string | null;
  destinationBin: BinDetail | null;

  quantity: number;
  uom: string;
  week_number: number;
  status: string;

  transactionScanPicking: TransactionScanPicking[];
}

export interface DoDetail {
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

export interface MemoDetail {
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
  barcode_image_url: string | null;
  is_staging: string | null; // "INBOUND" | "OUTBOUND" | null
  is_good_stock: boolean;
}

export interface BinDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  organization_id: number;
  warehouse_sub_id: string;
  name: string;
  code: string;
  description: string;
  capacity_pallet: number | null;
  barcode_image_url: string | null;
  current_pallet: string | null;
}

export interface TransactionScanPicking {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  transaction_picking_id: string;
  pallet_source_id: string | null;
  pallet_use_id: string | null;
  pallet_switch_id: string | null;
  item_id: string;
  quantity_picked: number;
  quantity_switch: number | null;
  uom: string;
  week_number: number;
  status: string;
  user_id: string;
  user_name: string;
  inspection_by: string | null;
}

export type PickingMemoList = PickingMemoRecord[];
