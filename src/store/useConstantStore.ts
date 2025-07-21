import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ConstantState {
  vehicle: any[];
  items: any[];
  uom: any[];
  setVehicle: (vehicle: any[]) => void;
  setItems: (items: any[]) => void;
  setUom: (uom: any[]) => void;
  getVehicle: () => void;
  getItems: () => void;
  getUom: () => void;
  clearConstants: () => void;
}

const useConstantStore = create<ConstantState>(set => ({
  vehicle: [],
  items: [],
  uom: [],
  setVehicle: async (vehicle: any[]) => {
    await AsyncStorage.setItem('vehicle', JSON.stringify(vehicle));
    set({ vehicle });
  },
  setItems: async (items: any[]) => {
    await AsyncStorage.setItem('items', JSON.stringify(items));
    set({ items });
  },
  setUom: async (uom: any[]) => {
    await AsyncStorage.setItem('uom', JSON.stringify(uom));
    set({ uom });
  },
  getVehicle: async () => {
    const storedVehicle = await AsyncStorage.getItem('vehicle');
    set({ vehicle: storedVehicle ? JSON.parse(storedVehicle) : [] });
  },
  getItems: async () => {
    const storedItems = await AsyncStorage.getItem('items');
    set({ items: storedItems ? JSON.parse(storedItems) : [] });
  },
  getUom: async () => {
    const storedUom = await AsyncStorage.getItem('uom');
    set({ items: storedUom ? JSON.parse(storedUom) : [] });
  },
  clearConstants: async () => {
    await AsyncStorage.removeItem('vehicle');
    await AsyncStorage.removeItem('items');
    await AsyncStorage.removeItem('uom');
    set({ vehicle: [], items: [], uom: [] });
  },
}));

export default useConstantStore;
