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
      console.error('Inbound failed:', error);
      throw error.response;
    }
  }

  static async getInboundDetail(inboundId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('inbound/' + inboundId);
      return response.data;
    } catch (error: any) {
      console.error('get Inbound list failed:', error);
      throw error.response;
    }
  }

  static async updateStatusInbound(inboundId: string, data: any): Promise<any> {
    try {
      const response = await axiosInstance.patch('inbound/' + inboundId + '/status', data);
      return response.data;
    } catch (error: any) {
      console.error('get Inbound list failed:', error);
      throw error.response;
    }
  }

  static async getHelperList(inboundId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('assigned-helper', { params: { inbound_id: inboundId } });
      return response.data;
    } catch (error: any) {
      console.error('get helper list failed:', error);
      throw error.response;
    }
  }

  static async postHelper(data: any): Promise<any> {
    try {
      const response = await axiosInstance.post('assigned-helper', data);
      return response.data;
    } catch (error: any) {
      console.error('post helper failed:', error);
      throw error.response;
    }
  }

  static async updateHelper(helperId: string, data: any): Promise<any> {
    try {
      const response = await axiosInstance.patch('assigned-helper/' + helperId, data);
      return response.data;
    } catch (error: any) {
      console.error('update helper failed:', error);
      throw error.response;
    }
  }

  //UNLOADING SERVICES
  static async getUnloadingList(inboundId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('transaction-scan-inbound', { params: { inbound_id: inboundId } });
      return response.data;
    } catch (error: any) {
      console.error('Unloading failed:', error);
      throw error.response;
    }
  }

  static async postUnloading(data: UnloadingPayload): Promise<any> {
    try {
      const response = await axiosInstance.post('transaction-scan-inbound', data);
      return response.data;
    } catch (error: any) {
      console.error('Unloading failed:', error);
      throw error.response;
    }
  }

  static async getUnloadingScanList(inboundId: string,status:string): Promise<any> {
    try {
      const response = await axiosInstance.get('transaction-scan-inbound', { params: { inbound_id: inboundId, status: status } });
      return response.data;
    } catch (error: any) {
      console.error('Unloading failed:', error);
      throw error.response;
    }
  }

  static async getStagingArea(): Promise<any> {
    try {
      const response = await axiosInstance.get('/master-warehouse-sub/is-staging', { params: { is_staging:"INBOUND" } });
      return response.data;
    } catch (error: any) {
      console.error('Get Staging Area failed:', error);
      throw error.response;
    }
  }

  static async getPalletInfo(palletId: string): Promise<any> {
    try {
      const response = await axiosInstance.get('/master-pallet/by-code/' + palletId + '/capacity-validation');
      return response.data;
    } catch (error: any) {
      console.error('Get Pallet Info failed:', error);
      throw error.response;
    }
  }

  static async getWeekProduction(date: string): Promise<any> {
    try {
      const response = await axiosInstance.get('master-week/find-by-date/' + date);
      return response.data;
    } catch (error: any) {
      console.error('Unloading failed:', error);
      throw error.response;
    }
  }
}

export default InboundServices;
