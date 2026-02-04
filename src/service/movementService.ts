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

  static async getMoveLocationForklift(userId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/inventory-movement/assigned/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response;
    }
}

}

export default MovementService;
