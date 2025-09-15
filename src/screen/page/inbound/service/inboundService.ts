
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
                    deletedAt: null
            });
        }
    }
}

  // Hasil akhirnya array
  return Array.from(itemMap.values());
}

