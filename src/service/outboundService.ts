import axiosInstance from '../config/axiosInstance.ts';


class OutboundService {
  //PICKING SERVICES
  static async getOutboundPickingDoList(userId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/outbound-do/assigned-user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getSkuByMemoId(memoId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/transaction-picking/memo/${memoId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getTransactionPickingDetail(transactionPickingId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/transaction-scan-picking/picking/${transactionPickingId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getAssignPickingUser(memoId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/assigned-picking/memo/${memoId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  //post transaction picking
  static async postTransactionPicking(payload: any): Promise<any> {
    try {
      const response = await axiosInstance.post('/transaction-scan-picking', payload);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  //update status picking to wh_staff or wh_staff approved it
  static async updateStatusPicking(inspection_by: string, pickingId: string, status: any): Promise<any> {
    try {
      const response = await axiosInstance.post(`/transaction-scan-picking/${pickingId}/${status}`, { inspection_by });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async updateStatusPickingBulk(payload: any): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/transaction-scan-picking/update-status`, payload);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  //INSPECTION SERVICES
  static async getOutboundDoList(data: any): Promise<any> {
    try {
      const response = await axiosInstance.get(`/outbound-do/`, { params: data });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async updateTransactionPickingDetail(transactionPickingId: string, payload: any): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/transaction-scan-picking/${transactionPickingId}`, payload);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async cancelMemo(memoId: string): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/transaction-picking/memo/${memoId}/detach`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async updateStatusWhenCompleteInspection(doId: string, statusPayload: string): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/outbound-do/${doId}`, { status: statusPayload });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async deleteTranscationScan(transactionPickingId: string): Promise<any> {
    try {
      const response = await axiosInstance.delete(`/transaction-scan-picking/${transactionPickingId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }
  //for assign gate
  static async getOutboundDetailById(outboundDoId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/outbound-do/${outboundDoId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async updateOutboundDoVehicleInfo(outboundDoId: string, payload: any): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/outbound-do/${outboundDoId}`, payload);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }
}

export default OutboundService;
