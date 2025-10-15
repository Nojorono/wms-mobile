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
}

export default OutboundService;
