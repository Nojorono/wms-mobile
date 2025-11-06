
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
    quantities?: Record<string, number>;
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
  const itemMap = new Map<
    string,
    Omit<InboundItem, "quantity" | "inbound_do_id" | "createdAt" | "updatedAt"> & {
      quantities: Record<string, number>; // contoh: { bal: 10, dus: 20 }
    }
  >();

  for (const inbound of data) {
    for (const item of inbound.inbound_items || []) {
      if (!item || !item.item_id || !item.uom) continue;

      const key = item.item_id;

      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!;

        // 🔹 Tambahkan quantity per UOM
        existing.quantities[item.uom] = 
          (existing.quantities[item.uom] || 0) + (item.quantity || 0);

      } else {
        // 🔹 Buat entri baru dengan quantities awal
        itemMap.set(key, {
          id: item.id,
          item_id: item.item_id,
          inbound_id: item.inbound_id,
          classification_id: item.classification_id,
          uom: item.uom,
          quantities: { [item.uom]: item.quantity || 0 },
          deletedAt: item.deletedAt ?? null,
          item: item.item,
        });
      }
    }
  }

  return Array.from(itemMap.values());
}


// export function mergeUnloadingData2(data: InboundDo[]) {
//   // Map untuk menampung hasil merge per item_id + uom
//   const itemMap = new Map<
//     string,
//     Omit<InboundItem, "quantity" | "inbound_do_id" | "createdAt" | "updatedAt"> & {
//       quantity: number;
//     }
//   >();

//   for (const inbound of data) {
//     for (const item of inbound.inbound_items) {
//       // Gunakan kombinasi item_id + uom sebagai key unik
//       const key = `${item.item_id}_${item.uom}`;

//       if (itemMap.has(key)) {
//         // Jika sudah ada kombinasi item_id + uom tersebut, tambahkan quantity
//         const existing = itemMap.get(key)!;
//         existing.quantity += item.quantity;
//         itemMap.set(key, existing);
//       } else {
//         // Jika belum ada, simpan sebagai entry baru
//         itemMap.set(key, {
//           id: item.id,
//           item_id: item.item_id,
//           inbound_id: item.inbound_id,
//           classification_id: item.classification_id,
//           uom: item.uom,
//           quantity: item.quantity,
//           deletedAt: null,
//           item: item.item,
//         });
//       }
//     }
//   }

//   // Kembalikan hasil sebagai array
//   return Array.from(itemMap.values());
// }


export function transformInspectionResponse(inbound: any): any {
  const planMap = new Map<
    string,
    {
      item_id: string;
      sku: string;
      description: string;
      quantities_plan: Record<string, number>;
      quantities_scan: Record<string, number>;
      latestStatus?: { status: string; updatedAt: string };
    }
  >();

  // 🔹 Hitung quantity_plan per item_id + uom
  inbound.inbound_dos.forEach((doItem: any) => {
    doItem.inbound_items.forEach((item: any) => {
      const key = item.item_id;
      if (!planMap.has(key)) {
        planMap.set(key, {
          item_id: item.item_id,
          sku: item.item?.sku ?? "",
          description: item.item?.description ?? "",
          quantities_plan: {},
          quantities_scan: {},
          latestStatus: undefined,
        });
      }
      const current = planMap.get(key)!;
      current.quantities_plan[item.uom] =
        (current.quantities_plan[item.uom] || 0) + item.quantity;
    });
  });

  // 🔹 Hitung quantity_scan per item_id + uom
  inbound.transaction_scan_inbounds.forEach((scan: any) => {
    const key = scan.item_id;
    if (!planMap.has(key)) {
      planMap.set(key, {
        item_id: scan.item_id,
        sku: "",
        description: "",
        quantities_plan: {},
        quantities_scan: {},
        latestStatus: undefined,
      });
    }
    const current = planMap.get(key)!;
    current.quantities_scan[scan.uom] =
      (current.quantities_scan[scan.uom] || 0) + scan.quantity;

    // Ambil status terbaru
    if (scan.status) {
      if (
        !current.latestStatus ||
        new Date(scan.updatedAt) > new Date(current.latestStatus.updatedAt)
      ) {
        current.latestStatus = {
          status: scan.status,
          updatedAt: scan.updatedAt,
        };
      }
    }
  });

  // 🔹 Konversi ke array hasil akhir
  return {
    ...inbound,
    items_summary: Array.from(planMap.values()).map((item) => ({
      item_id: item.item_id,
      sku: item.sku,
      description: item.description,
      quantities: Object.keys({
        ...item.quantities_plan,
        ...item.quantities_scan,
      }).reduce((acc, uom) => {
        acc[uom] = {
          plan: item.quantities_plan[uom] || 0,
          scan: item.quantities_scan[uom] || 0,
        };
        return acc;
      }, {} as Record<string, { plan: number; scan: number }>),
      status: item.latestStatus?.status ?? "UNSCANNED",
    })),
  };
}



export function transformInspectionResponse2(inbound: any): any {
  const planMap = new Map<
    string,
    {
      item_id: string;
      sku: string;
      uom: string;
      description: string;
      quantity_plan: number;
      quantity_scan: number;
      latestStatus?: { status: string; updatedAt: string };
    }
  >();

  // 🔹 Hitung quantity_plan
  inbound.inbound_dos.forEach((doItem: any) => {
    doItem.inbound_items.forEach((item: any) => {
      if (!planMap.has(item.item_id)) {
        planMap.set(item.item_id, {
          item_id: item.item_id,
          uom: item.uom,
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
        uom: "",
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
        current.latestStatus = {
          status: scan.status,
          updatedAt: scan.updatedAt,
        };
      }
    }
  });

  return {
    ...inbound,
    items_summary: Array.from(planMap.values()).map((item) => ({
      item_id: item.item_id,
      sku: item.sku,
      uom:item.uom,
      description: item.description,
      quantity_plan: item.quantity_plan,
      quantity_scan: item.quantity_scan,
      status: item.latestStatus?.status ?? "UNSCANNED",
    })),
  };
}



export function mergeGoodReceive(inboundData: any) {
  const resultMap = new Map();

  // Helper untuk memastikan float
  const toFloat = (val: any) => parseFloat(val ?? 0) || 0.0;

  // step 1: isi PLAN & INSPECTED
  inboundData.inbound_dos.forEach((doEntry: any) => {
    doEntry.inbound_items.forEach((item: any) => {
      const key = item.item_id;
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          item_id: item.item_id,
          sku: item.item.sku,
          do_id: doEntry.id,
          inspection_status: item.inspection_status,
          description: item.item.description,
          uom: item.uom,
          quantity_plan: 0.0,
          quantity_scanned: 0.0,
          quantity_inspected: 0.0,
          details: [],
        });
      }

      const existing = resultMap.get(key);
      existing.quantity_plan += toFloat(item.quantity);
      existing.quantity_inspected += toFloat(item.quantity_inspection);

      existing.details.push({
        item_id_inbound: item.id,
        do_number: doEntry.inbound_do_number,
        po_number: doEntry.inbound_po_number,
        quantity_inspected: toFloat(item.quantity_inspection),
        quantity_plan: toFloat(item.quantity),
        quantity_scanned: 0.0,
        uom: item.uom,
      });
    });
  });

  // step 2: distribusi SCAN ke detail plan
  inboundData.transaction_scan_inbounds.forEach((scan: any) => {
    const key = scan.item_id;
    if (!resultMap.has(key)) return;

    const existing = resultMap.get(key);
    let remaining = toFloat(scan.quantity);

    for (const detail of existing.details) {
      const available = toFloat(detail.quantity_plan) - toFloat(detail.quantity_scanned);
      if (available <= 0) continue;

      const allocate = Math.min(available, remaining);
      detail.quantity_scanned = toFloat(detail.quantity_scanned) + allocate;
      existing.quantity_scanned = toFloat(existing.quantity_scanned) + allocate;
      remaining -= allocate;

      if (remaining <= 0) break;
    }

    // jika masih ada sisa scan yang tidak bisa dipetakan ke PLAN
    if (remaining > 0) {
      existing.details.push({
        do_number: null,
        po_number: null,
        quantity_plan: 0.0,
        quantity_scanned: remaining,
        quantity_inspected: 0.0,
        uom: scan.uom,
        note: "EXCESS_SCAN",
      });
      existing.quantity_scanned = toFloat(existing.quantity_scanned) + remaining;
    }
  });

  // optional: pastikan semua nilai akhir dibulatkan ke 2 desimal (jika dibutuhkan)
  return Array.from(resultMap.values()).map((entry) => ({
    ...entry,
    quantity_plan: parseFloat(entry.quantity_plan.toFixed(2)),
    quantity_scanned: parseFloat(entry.quantity_scanned.toFixed(2)),
    quantity_inspected: parseFloat(entry.quantity_inspected.toFixed(2)),
    details: entry.details.map((d: any) => ({
      ...d,
      quantity_plan: parseFloat(d.quantity_plan.toFixed(2)),
      quantity_scanned: parseFloat(d.quantity_scanned.toFixed(2)),
      quantity_inspected: parseFloat(d.quantity_inspected.toFixed(2)),
    })),
  }));
}

// COMPARE SCAN PADA UNLOADING SCAN
export function compareScanWithReference(reference: Record<string, number>, scan: Record<string, number>): boolean {
  for (const uom in scan) {
    const refQty = reference[uom] || 0;
    const scanQty = scan[uom];
    if (scanQty > refQty) return false;
  }
  return true;
}


//AMBIL SCAN UNTUK INSPECTION DETAIL
export function getScanTotals(data:any) {
  return data.reduce((acc:any, item:any) => {
    const key = item.uom;
    if (!acc[key]) acc[key] = { scan: 0 };
    acc[key].scan += item.qty;
    return acc;
  }, {});
}



