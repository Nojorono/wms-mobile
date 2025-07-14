import axiosInstance from '../config/axiosInstance.ts';


class OutboundService {
  static async getOutboundList(userId:string): Promise<any> {
    try {
      const response = await axiosInstance.get('checker-assign/user/' + userId);
      return response.data;
    } catch (error: any) {
      console.error('Outbound failed:', error);
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

  static async inboundTransporter(data:any): Promise<any> {
    try {
      const response = await axiosInstance.post('inbound-transporter',data);

      return response.data;
    } catch (error: any) {
      console.error('get transporter list failed:', error);
      throw error.response;
    }
  }

  static async getInboundDetail(idInboundPlan:any): Promise<any> {
    try {
      const response = await axiosInstance.get('inbound-plan/'+idInboundPlan);

      return response.data;
    } catch (error: any) {
      console.error('get inbound plan failed:', error);
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
}

export default OutboundService;
