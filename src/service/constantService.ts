import axiosInstance from "../config/axiosInstance";


class ConstantService {

  static async getVehicleType(): Promise<any> {
    try {
      const response = await axiosInstance.get(`/master-vehicle`);
      return response.data
    } catch (error: any) {
      console.error('Get vehicle failed:', error);
      throw new Error('Get vehicle failed: ' + error.message);
    }
  }

  static async getItems(idInboundPlan:string): Promise<any> {
    try {
      const response = await axiosInstance.get(`inbound-plan/`+idInboundPlan);
      return response.data
    } catch (error: any) {
      console.error('Get items failed:', error);
      throw new Error('Get items failed: ' + error.message);
    }
  }

  static async getUom(): Promise<any> {
    try {
      const response = await axiosInstance.get(`/master-uom`);
      return response.data
    } catch (error: any) {
      console.error('Get uom failed:', error);
      throw new Error('Get uom failed: ' + error.message);
    }
  }
}

export default ConstantService;
