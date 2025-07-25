import axiosInstance from '../config/axiosInstance.ts';


class InboundServices {
  static async getInboundList(userId:string): Promise<any> {
    try {
      const response = await axiosInstance.get('checker-assign/user/' + userId);
      return response.data;
    } catch (error: any) {
      console.error('Inbound failed:', error);
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

  static async getInboundDeliveryOrder(idInboundPlan:any): Promise<any> {
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
