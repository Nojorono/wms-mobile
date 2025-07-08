import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ConstantState {
    vehicle: any[];
    setVehicle: (vehicle: any[]) => void;
    getVehicle: () => void;
    clearConstants: () => void;
}

const useConstantStore = create<ConstantState>((set) => ({
    vehicle: [],
    setVehicle: async (vehicle: any[]) => {
        await AsyncStorage.setItem('vehicle', JSON.stringify(vehicle));
        set({ vehicle });
    },
    getVehicle: async () => {
        const storedVehicle = await AsyncStorage.getItem('vehicle');
        set({ vehicle: storedVehicle ? JSON.parse(storedVehicle) : [] });
    },
    clearConstants: async () => {
        await AsyncStorage.removeItem('vehicle');
        set({ vehicle: []});
    },
}));

export default useConstantStore;
