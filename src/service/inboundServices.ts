import axiosInstance from '../config/axiosInstance.ts';
import { HelperInterface } from '../interface/inbound/HelperInterface.ts';
import { InboundMainResponse } from '../interface/inbound/inboundMainInterface.ts';
import { UnloadingPayload } from '../interface/inbound/unloadingInterface.ts';


class InboundServices {
  static async getInboundList(statusInput: string): Promise<InboundMainResponse> {
    try {
      const response = await axiosInstance.get('inbound', { params: { status: statusInput , limit:100} });
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

  static async deleteHelper(helperId: string): Promise<any> {
    try {
      const response = await axiosInstance.delete('assigned-helper/' + helperId);
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
      const response = await axiosInstance.get('transaction-scan-inbound', { params: { inbound_id: inboundId, item_id: itemId } });
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

  static async getPalletInfo(palletCode: string): Promise<any> {
    try {
      const response = await axiosInstance.get('/inventory-tracking/validate-pallet/' + palletCode);
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

static async postStatusBulkbyIdScan(inspection_by: string, status: string, data: any): Promise<any> {
  try {
    const response = await axiosInstance.post(
      `transaction-scan-inbound/update-many-status-to`,
      data,
      {
        params: {
          status,
          inspection_by,
        },
      }
    );
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

  static async getInspectionByInboundId(inboundId: string): Promise<any> {
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
      return response.data;
    } catch (error: any) {
      console.error("Error updating inspection data:", error);
      throw error.response;
    }
  }

  static async updateInspectionWhenPalletChange(itemId: string, data: any): Promise<any> {
    try {
      const response = await axiosInstance.post(`/transaction-scan-inbound/change-pallet/${itemId}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async approveInspectionById(item_id: string, status_item: string): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/transaction-scan-inbound/inspection-approved/${item_id}?status=${status_item}`);
      return response.data;

    } catch (error: any) {
      throw error.response;
    }
  }

  //GOOD RECEIVE SERVICES
  static async updateGoodReceiveDetail(data: any): Promise<any> {
    try {
      const response = await axiosInstance.patch(`inbound/inbound-items/bulk/saldo-inspection`, data);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async updateStatusAfterGoodReceive(inboundId: string,): Promise<any> {
    try {
      const response = await axiosInstance.patch(`inbound/sequential-status/${inboundId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async postIntegrationToOracle(inboundId: string): Promise<any> {
    try {
      const response = await axiosInstance.post(`/inbound/integration-to-oracle/${inboundId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  //FORKLIFT SERVICES
  static async getForkLiftList(userId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/put-away/find-task/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async postForkLiftComplete(id: string): Promise<any> {
    try {
      const response = await axiosInstance.post(`/put-away/task-completed/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }
}

export default InboundServices;
