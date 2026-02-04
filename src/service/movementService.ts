import axiosInstance from '../config/axiosInstance.ts';


class MovementService {
  static async getInventoryMovement(): Promise<any> {
    try {
      const response = await axiosInstance.get(`/inventory-movement`,{ params: { status: "PENDING", }});
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
  }

}

export default MovementService;
