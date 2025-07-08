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
}

export default ConstantService;
