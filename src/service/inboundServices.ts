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
}

export default InboundServices;
