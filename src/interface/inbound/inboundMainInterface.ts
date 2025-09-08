export interface InboundMainItem {
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
}

export interface InboundMainDO {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    inbound_id: string;
    inbound_do_number: string;
    inbound_do_date: string;
    attachment: string | null;
    inbound_po_number: string | null;
    inbound_po_date: string | null;
    flag_validated: boolean;
    inbound_items: InboundMainItem[];
}

export interface InboundMainData {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    inbound_number: string;
    expedition: string;
    origin: string;
    license_plate: string;
    driver_name: string;
    driver_phone: string;
    status: string;
    inbound_type: string;
    arrival_date: string;
    inbound_dos: InboundMainDO[];
}

export interface InboundMainResponse {
    success: boolean;
    message: string;
    data: InboundMainData[];
    timestamp: string;
    path: string;
}