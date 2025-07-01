import axiosInstance from '../config/axiosInstance.ts';
import AuthServices from './authService.ts';

class InboundServices {
  static async getInboundList(userId:string): Promise<any> {
    try {
      const response = await axiosInstance.get('checker-assign/user/' + userId);
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error.response;
    }
  }
}

export default InboundServices;
