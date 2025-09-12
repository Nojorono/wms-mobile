import axiosInstance from '../config/axiosInstance.ts';
import { HelperInterface } from '../interface/inbound/HelperInterface.ts';
import { InboundMainResponse } from '../interface/inbound/inboundMainInterface.ts';


class UserServices {
  static async getUserList(): Promise<any> {
    try {
      const response = await axiosInstance.get('user');
      return response.data;
    } catch (error: any) {
      console.error('User failed:', error);
      throw error.response;
    }
  }

}

export default UserServices;
