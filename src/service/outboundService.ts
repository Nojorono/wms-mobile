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

  //update status picking to wh_staff
  static async updateStatusPicking(inspection_by: string,pickingId: string, status: any): Promise<any> {
    try {
      const response = await axiosInstance.post(`/transaction-scan-picking/${pickingId}/${status}`, { inspection_by });
      return response.data;
    } catch (error: any) {
      throw error.response;
    } 
  }
}


export default OutboundService;
