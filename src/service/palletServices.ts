import axiosInstance from '../config/axiosInstance.ts';


class ScannerService {
  static async getPalletByCode(palletCode:string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/master-pallet/by-code/${palletCode}/current`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async postPalletAdjustment(payload: any): Promise<any> {
    try {
      const response = await axiosInstance.post('/stock-adjustment-approval', payload);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getItemById(itemId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/master-item/${itemId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  //UPDATE PALLET
  static async updatePalletById(palletId: string, payload: any): Promise<any> {
    try {
      const response = await axiosInstance.put(`/master-pallet/${palletId}`, payload);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

}

export default ScannerService;
