
export type ItemDetail = {
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
    organization_id: string | null;
};

export type InboundItem = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    inbound_id: string;
    inbound_do_id: string;
    item_id: string;
    quantity: number;
    classification_id: string | null;
    uom: string;
    item: ItemDetail;
};

export type InboundDo = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    inbound_id: string;
    inbound_do_number: string;
    inbound_do_date: string;
    attachment: string | null;
    inbound_po_number: string;
    inbound_po_date: string;
    flag_validated: boolean;
    inbound_items: InboundItem[];
};

export type MergedItem = Omit<
  InboundItem,
   "createdAt" | "updatedAt" | "inbound_do_id"
> & {
  quantity: number;
};

export type InboundItemWithPo = InboundItem & { inbound_po_number: string };

export function mergeInboundDos(data: InboundDo[]): (Omit<InboundDo, 'inbound_items'> & { inbound_items: InboundItemWithPo[] })[] {
    // Group by inbound_do_number
    const map = new Map<string, Omit<InboundDo, 'inbound_items'> & { inbound_items: InboundItemWithPo[] }>();

    data.forEach((doItem) => {
        const key = `${doItem.inbound_do_number}`;
        // Gabungkan item_id yang sama dan jumlahkan quantity
        const itemMap = new Map<string, InboundItemWithPo>();
        doItem.inbound_items.forEach(item => {
            const itemKey = item.item_id;
            if (itemMap.has(itemKey)) {
                const existing = itemMap.get(itemKey)!;
                itemMap.set(itemKey, {
                    ...existing,
                    quantity: existing.quantity + item.quantity,
                });
            } else {
                itemMap.set(itemKey, {
                    ...item,
                    inbound_po_number: doItem.inbound_po_number,
                });
            }
        });
        const itemsWithPo = Array.from(itemMap.values());

        if (map.has(key)) {
            const existing = map.get(key)!;
            // Gabungkan item_id yang sama juga pada existing
            const combinedMap = new Map<string, InboundItemWithPo>();
            [...existing.inbound_items, ...itemsWithPo].forEach(item => {
                const itemKey = item.item_id;
                if (combinedMap.has(itemKey)) {
                    const exist = combinedMap.get(itemKey)!;
                    combinedMap.set(itemKey, {
                        ...exist,
                        inbound_po_number: exist.inbound_po_number + ', ' + item.inbound_po_number,
                        quantity: exist.quantity + item.quantity,
                    });
                } else {
                    combinedMap.set(itemKey, { ...item });
                }
            });
            existing.inbound_items = Array.from(combinedMap.values());
        } else {
            // Copy all fields except inbound_items, then add inbound_items with PO number
            const { inbound_items, ...rest } = doItem;
            map.set(key, { ...rest, inbound_items: itemsWithPo });
        }
    });
    console.log("Merged Data:", Array.from(map.values()));
    return Array.from(map.values());
}

export function mergeUnloadingData(data: InboundDo[]) {
  // Map untuk menampung hasil merge per item_id
  const itemMap = new Map<
    string,
    Omit<InboundItem, "quantity" | "inbound_do_id" | "createdAt" | "updatedAt"> & {
      quantity: number;
    }
  >();
for (const inbound of data) {
    for (const item of inbound.inbound_items) {
        if (itemMap.has(item.item_id)) {
            // kalau sudah ada, tambahkan quantity
            const existing = itemMap.get(item.item_id)!;
            existing.quantity += item.quantity;
            itemMap.set(item.item_id, existing);
        } else {
            // kalau belum ada, simpan baru
            itemMap.set(item.item_id, {
                    id: item.id,
                    item_id: item.item_id,
                    inbound_id: item.inbound_id,
                    classification_id: item.classification_id,
                    uom: item.uom,
                    quantity: item.quantity,
                    deletedAt: null,
                    item: item.item
            });
        }
    }
}

  // Hasil akhirnya array
  return Array.from(itemMap.values());
}


type ItemSummary = {
  item_id: string;
  sku: string;
  description: string;
  quantity_plan: number;
  quantity_scan: number;
};

export function transformInspectionResponse(inbounds: any[]): any[] {
  return inbounds.map((inbound) => {
    const planMap = new Map<
      string,
      ItemSummary & { latestStatus?: { status: string; updatedAt: string } }
    >();

    // 🔹 Hitung quantity_plan
    inbound.inbound_dos.forEach((doItem: any) => {
      doItem.inbound_items.forEach((item: any) => {
        if (!planMap.has(item.item_id)) {
          planMap.set(item.item_id, {
            item_id: item.item_id,
            sku: item.item?.sku ?? "",
            description: item.item?.description ?? "",
            quantity_plan: 0,
            quantity_scan: 0,
            latestStatus: undefined,
          });
        }
        const current = planMap.get(item.item_id)!;
        current.quantity_plan += item.quantity;
      });
    });

    // 🔹 Hitung quantity_scan & ambil status terbaru
    inbound.transaction_scan_inbounds.forEach((scan: any) => {
      if (!planMap.has(scan.item_id)) {
        planMap.set(scan.item_id, {
          item_id: scan.item_id,
          sku: "",
          description: "",
          quantity_plan: 0,
          quantity_scan: 0,
          latestStatus: undefined,
        });
      }
      const current = planMap.get(scan.item_id)!;
      current.quantity_scan += scan.quantity;

      if (scan.status) {
        if (
          !current.latestStatus ||
          new Date(scan.updatedAt) > new Date(current.latestStatus.updatedAt)
        ) {
          current.latestStatus = { status: scan.status, updatedAt: scan.updatedAt };
        }
      }
    });

    return {
      ...inbound,
      items_summary: Array.from(planMap.values()).map((item) => ({
        item_id: item.item_id,
        sku: item.sku,
        description: item.description,
        quantity_plan: item.quantity_plan,
        quantity_scan: item.quantity_scan,
        status: item.latestStatus?.status ?? "UNSCANNED",
      })),
    };
  });
}

export function mergeGoodReceive(inboundData:any) {
  const resultMap = new Map();

  // step 1: isi PLAN
  inboundData.inbound_dos.forEach((doEntry:any) => {
    doEntry.inbound_items.forEach((item:any) => {
      const key = item.item_id;
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          item_id: item.item_id,
          sku: item.item.sku,
          description: item.item.description,
          uom: item.uom,
          quantity_plan: 0,
          quantity_scanned: 0,
          details: []
        });
      }

      const existing = resultMap.get(key);
      existing.quantity_plan += item.quantity;

      existing.details.push({
        item_id_inbound: item.id,
        do_number: doEntry.inbound_do_number,
        po_number: doEntry.inbound_po_number,
        quantity_plan: item.quantity,
        quantity_scanned: 0,
        uom: item.uom
      });
    });
  });

  // step 2: distribusi SCAN ke detail plan
  inboundData.transaction_scan_inbounds.forEach((scan:any) => {
    const key = scan.item_id;
    if (!resultMap.has(key)) return;

    const existing = resultMap.get(key);
    let remaining = scan.quantity;

    for (const detail of existing.details) {
      const available = detail.quantity_plan - detail.quantity_scanned;
      if (available <= 0) continue;

      const allocate = Math.min(available, remaining);
      detail.quantity_scanned += allocate;
      existing.quantity_scanned += allocate;
      remaining -= allocate;

      if (remaining <= 0) break;
    }

    // kalau masih ada sisa scan yg tidak bisa dipetakan ke PLAN
    if (remaining > 0) {
      existing.details.push({
        do_number: null,
        po_number: null,
        quantity_plan: 0,
        quantity_scanned: remaining,
        uom: scan.uom,
        note: "EXCESS_SCAN"
      });
      existing.quantity_scanned += remaining;
    }
  });

  return Array.from(resultMap.values());
}



