import axiosInstance from '../config/axiosInstance.ts';


class MovementService {
    static async getInventoryMovement(data: any): Promise<any> {
        try {
             const params: any = { limit: data?.limit || 100 };
            if (data?.status && data.status !== '') {
                params.status = data.status;
            }
            const response = await axiosInstance.get(`/inventory-movement`, { params });
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

    static async deleteInventoryMovement(id: string): Promise<any> {
        try {
            const response = await axiosInstance.delete(`/inventory-movement/${id}`);   
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    //UPDATE INVENTORY
    static async getUpdateInventoryList(data?: any): Promise<any> {
        try {
            const params: any = { limit: data?.limit || 100 };
            if (data?.status && data.status !== '') {
                params.status = data.status;
            }
            const response = await axiosInstance.get(`/pallet-update`, { params });
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    } 

    static async postUpdateInventory(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/pallet-update`, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async postUpdateInventorySplit(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/pallet-update/split`, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async postUpdateInventoryMerge(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/pallet-update/merge`, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    // Helper Movement
    static async postPalletUpdateScanHelper(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/pallet-update/scan`, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    //inspection
    static async approveInspectionMerge(idUpdate: string, data: any): Promise<any> {
        try {
            const response = await axiosInstance.get(`/pallet-update/approve-merge-pallet/${idUpdate}`, { params: data });
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

     static async approveInspectionSplit(idUpdate: string, data: any): Promise<any> {
        try {
            const response = await axiosInstance.get(`/pallet-update/approve-split-pallet/${idUpdate}`, { params: data });
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async rejectInspection(idUpdate: string): Promise<any> {
        try {
            const response = await axiosInstance.delete(`/pallet-update/${idUpdate}`);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

     static async rejectInspectionPallet(idUpdate: string): Promise<any> {
        try {
            const response = await axiosInstance.patch(`/pallet-update/${idUpdate}`, { status: 'REJECTED' });
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }
}

export default MovementService;
