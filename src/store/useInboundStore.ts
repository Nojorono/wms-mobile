import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface InboundState {
  inbound: any;
  setInbound: (inbound: any[]) => void;
  getInbound: () => void;
  clearInbound: () => void;
}

const useInboundStore = create<InboundState>((set) => ({
  inbound: [],
  setInbound: async (inbound: any[]) => {
    await AsyncStorage.setItem('inbound', JSON.stringify(inbound));
    set({ inbound });
  },
  getInbound: async () => {
    const storedInbound = await AsyncStorage.getItem('inbound');
    set({ inbound: storedInbound ? JSON.parse(storedInbound) : [] });
  },
  clearInbound: async () => {
    await AsyncStorage.removeItem('inbound');
    set({ inbound: []});
  },
}));

export default useInboundStore;
