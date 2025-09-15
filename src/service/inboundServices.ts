import axiosInstance from '../config/axiosInstance.ts';
import { HelperInterface } from '../interface/inbound/HelperInterface.ts';
import { InboundMainResponse } from '../interface/inbound/inboundMainInterface.ts';


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
  static async getUnloadingList(): Promise<InboundMainResponse> {
    try {
      const response = await axiosInstance.get('inbound', { params: { status: 'UNLOADING' } });
      return response.data;
    } catch (error: any) {
      console.error('Unloading failed:', error);
      throw error.response;
    }
  }
}

export default InboundServices;
