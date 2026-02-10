import axiosInstance from '../config/axiosInstance.ts';


class MovementService {
    static async getInventoryMovement(data: any): Promise<any> {
        try {
            const response = await axiosInstance.get(`/inventory-movement`, { data });
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async getMoveLocationForklift(userId: string): Promise<any> {
        try {
            const response = await axiosInstance.get(`/inventory-movement/assigned/${userId}`);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async postForkliftMovement(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/inventory-movement/move-pallet`, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

       static async postInspectionByPallet(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/inventory-movement/inspect-pallet`, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async postInventoryMovementNew(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/inventory-movement`, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async updateInventoryMovementStatus(id: string, data: any): Promise<any> {
        try {
            const response = await axiosInstance.patch(`/inventory-movement/${id}`, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    //UPDATE INVENTORY
    static async getUpdateInventory(data: any): Promise<any> {
        try {
            const response = await axiosInstance.get(`/pallet-update`,  data );
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    } 
}

export default MovementService;
