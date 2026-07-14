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

  static async getItems(idInboundPlan: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`inbound-plan/` + idInboundPlan);
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
      const response = await axiosInstance.get('master-supplier/attribute7', { params: { ATTRIBUTE7: "FREIGHT (FRG)", } });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getInventoryTracking(subId: string, binId?: string): Promise<any> {
    try {
      const url = `/inventory-tracking/warehouse?warehouse_sub_id=${subId}&${binId ? `&warehouse_bin_id=${binId}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getSubWarehouse(): Promise<any> {
    try {
      const response = await axiosInstance.get('/master-warehouse-sub');
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

  static async getBinsBySubWareHouseId(subWarehouseId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/master-warehouse-bin/warehouse-sub/${subWarehouseId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

    static async getWarehouse(): Promise<any> {
    try {
      const response = await axiosInstance.get('/master-warehouse');
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

    static async getTruckUtilitas(): Promise<any> {
    try {
      const response = await axiosInstance.get('/master-supplier/truck-util', { params: { limit: 50, } });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

    static async getPoLines(vendorNumber: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/master-supplier/po-lines`,{ params: { vendor_id: vendorNumber , limit:100} });
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }
}

export default ConstantService;
