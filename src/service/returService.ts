import axiosInstance from '../config/axiosInstance.ts';
import { HelperInterface } from '../interface/inbound/HelperInterface.ts';
import { InboundMainResponse } from '../interface/inbound/inboundMainInterface.ts';
import UserServices from './userServices.ts';


class ReturServices {
  static async getReturList(): Promise<any> {
    try {
      const response = await axiosInstance.get('retur');
      return response.data;
    } catch (error: any) {
      console.error('Retur failed:', error);
      throw error.response;
    }
  }

  static async getReturManagementList(): Promise<any> {
    try {
      const response = await axiosInstance.get('retur-manage/all');
      return response.data;
    } catch (error: any) {
      console.error('Retur failed:', error);
      throw error.response;
    }
  }

}

export default UserServices;
