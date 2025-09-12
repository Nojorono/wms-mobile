import axiosInstance from '../config/axiosInstance.ts';
import { HelperInterface } from '../interface/inbound/HelperInterface.ts';
import { InboundMainResponse } from '../interface/inbound/inboundMainInterface.ts';


class InboundServices {
  static async getInboundList(): Promise<InboundMainResponse> {
    try {
      const response = await axiosInstance.get('inbound', { params: { status: 'CREATED' } });
      return response.data;
    } catch (error: any) {
      console.error('Inbound failed:', error);
      throw error.response;
    }
  }

    static async getInboundDetail(inboundId:string): Promise<any> {
    try {
      const response = await axiosInstance.get('inbound/' + inboundId);
      return response.data;
    } catch (error: any) {
      console.error('get Inbound list failed:', error);
      throw error.response;
    }
  }

  static async getHelperList(inboundId:string): Promise<any> {
    try {
      const response = await axiosInstance.get('assigned-helper', { params: { inboundId } });
      return response.data;
    } catch (error: any) {
      console.error('get helper list failed:', error);
      throw error.response;
    }
  }

  static async postHelper(data:any): Promise<any> {
    try {
      const response = await axiosInstance.post('assigned-helper', data );
      return response.data;
    } catch (error: any) {
      console.error('post helper failed:', error);
      throw error.response;
    }
  }

   static async updateHelper(helperId:string, data:any): Promise<any> {
    try {
      const response = await axiosInstance.patch('assigned-helper/'+ helperId , data );
      return response.data;
    } catch (error: any) {
      console.error('update helper failed:', error);
      throw error.response;
    }
  }


  static async getTransporterList(inboundId:string): Promise<any> {
    try {
      const response = await axiosInstance.get('inbound-transporter/' + inboundId);
      return response.data;
    } catch (error: any) {
      console.error('get transporter list failed:', error);
      throw error.response;
    }
  }

  static async postInboundTransporter(data:any): Promise<any> {
    try {
      const response = await axiosInstance.post('inbound-transporter',data);
      return response.data;
    } catch (error: any) {
      console.error('get transporter list failed:', error);
      throw error.response;
    }
  }

  static async updateInboundTransporter(idTransporter:any,data:any): Promise<any> {
    try {
      const response = await axiosInstance.patch('inbound-transporter/'+idTransporter,data);
      return response.data;
    } catch (error: any) {
      console.error('get transporter list failed:', error);
      throw error.response;
    }
  }

  static async getListInboundScanning(idInboundPlan:any): Promise<any> {
    try {
      const response = await axiosInstance.get('checker-scanning/inbound-plan/'+idInboundPlan);

      return response.data;
    } catch (error: any) {
      console.error('get List inbound Scanning failed:', error);
      throw error.response;
    }
  }

  static async scanInboundDetail(data:any): Promise<any> {
    try {
      const response = await axiosInstance.post('/checker-scanning',data);

      return response.data;
    } catch (error: any) {
      console.error('post scan inbound failed:', error);
      throw error.response;
    }
  }

  static async getInboundDeliveryOrder(idInboundPlan:any): Promise<HelperInterface> {
    try {
      const response = await axiosInstance.get('inbound-delivery-order/'+idInboundPlan);

      return response.data;
    } catch (error: any) {
      console.error('get inbound delivery order failed:', error);
      throw error.response;
    }
  }

  static async postInboundDeliveryOrder(data:any): Promise<any> {
    try {
      const response = await axiosInstance.post('inbound-delivery-order',data);
      return response.data;
    } catch (error: any) {
      console.error('get transporter list failed:', error);
      throw error.response;
    }
  }

  static async updateInboundDeliveryOrder(idDeliveryOrder:any,data:any): Promise<any> {
    try {
      const response = await axiosInstance.patch('inbound-delivery-order/'+idDeliveryOrder,data);
      return response.data;
    } catch (error: any) {
      console.error('get transporter list failed:', error);
      throw error.response;
    }
  }

}

export default InboundServices;
