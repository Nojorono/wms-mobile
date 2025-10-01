import axiosInstance from '../config/axiosInstance.ts';
import { HelperInterface } from '../interface/inbound/HelperInterface.ts';
import { InboundMainResponse } from '../interface/inbound/inboundMainInterface.ts';
import { UnloadingPayload } from '../interface/inbound/unloadingInterface.ts';


class InboundServices {
  static async getInboundList(statusInput: string): Promise<InboundMainResponse> {
    try {
      const response = await axiosInstance.get('inbound', { params: { status: statusInput } });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getInboundDetail(inboundId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('inbound/' + inboundId);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async updateStatusInbound(inboundId: string, data: any): Promise<any> {
    try {
      const response = await axiosInstance.patch('inbound/' + inboundId + '/status', data);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getHelperList(inboundId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('assigned-helper', { params: { inbound_id: inboundId } });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async postHelper(data: any): Promise<any> {
    try {
      const response = await axiosInstance.post('assigned-helper', data);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async updateHelper(helperId: string, data: any): Promise<any> {
    try {
      const response = await axiosInstance.patch('assigned-helper/' + helperId, data);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  //UNLOADING SERVICES
  static async getUnloadingList(inboundId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('transaction-scan-inbound', { params: { inbound_id: inboundId } });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async postUnloading(data: UnloadingPayload): Promise<any> {
    try {
      const response = await axiosInstance.post('transaction-scan-inbound', data);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getUnloadingScanList(inboundId: string, itemId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('transaction-scan-inbound', { params: { inbound_id: inboundId,  item_id: itemId } });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async deleteUnloadingById(unloadingId: string): Promise<any> {
    try {
      const response = await axiosInstance.delete('transaction-scan-inbound/' + unloadingId);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getStagingArea(): Promise<any> {
    try {
      const response = await axiosInstance.get('/master-warehouse-sub/is-staging', { params: { is_staging: "INBOUND" } });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getPalletInfo(palletId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('/master-pallet/by-code/' + palletId + '/capacity-validation');
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getWeekProduction(date: string): Promise<any> {
    try {
      const response = await axiosInstance.get('master-week/find-by-date/' + date);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  //INSPECTION SERVICES
  static async getInspectionList(status: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`inbound/inspection`, { params: { status: status } });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getInspectionByInboundId(inboundId:string): Promise<any> {
     try {
      const response = await axiosInstance.get(`inbound/${inboundId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }

  }

  static async updateInspectionData(itemId: string, data: any): Promise<any> {
    try {
      const response = await axiosInstance.patch(`transaction-scan-inbound/${itemId}`, data);
      console.log("Response from updateInspectionData:", response);
      return response.data;
    } catch (error: any) {
      console.error("Error updating inspection data:", error);
      throw error.response;
    }
  }

  //GOOD RECEIVE SERVICES
  static async updateGoodReceiveDetail(data: any): Promise<any> {
    try {
      const response = await axiosInstance.patch(`inbound/inbound-items/bulk/saldo-inspection`,   data  );
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }
}

export default InboundServices;
