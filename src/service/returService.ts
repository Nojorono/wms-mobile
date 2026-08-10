import axiosInstance from '../config/axiosInstance.ts';
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

    static async postHelper(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post('inbound-retur/helpers/', data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async updateHelper(helperId: string, data: any): Promise<any> {
        try {
            const response = await axiosInstance.patch('inbound-retur/helpers/' + helperId, data);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

    static async deleteHelper(helperId: string): Promise<any> {
        try {
            const response = await axiosInstance.delete('inbound-retur/helpers/' + helperId);
            return response.data;
        } catch (error: any) {
            throw error.response;
        }
    }

}

export default ReturServices;
