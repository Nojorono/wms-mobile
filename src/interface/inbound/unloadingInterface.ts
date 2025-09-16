export interface UnloadingPayload {
    production_date: string;
    week_number: number;
    inbound_id: string;
    item_id: string;
    quantity: number;
    uom: string;
    user_id: string;
    user_name: string;
    pallet_code: string;
    status: string;
}