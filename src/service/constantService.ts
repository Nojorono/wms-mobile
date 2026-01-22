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
      throw new Error('Get uom failed: ' + error.message);
    }
  }

  static async getSuppliers(): Promise<any> {
       try {
      const response = await axiosInstance.get('master-supplier/attribute7', { params: { attribute7: "FREIGHT (FRG)",} });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }
}

export default ConstantService;
