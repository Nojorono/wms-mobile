import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface InboundPlan {
  id: string;
  organization_id: number;
  inbound_planning_no: string;
  delivery_no: string;
  po_no: string;
  client_name: string;
  order_type: string;
  task_type: string;
  notes: string;
  plan_delivery_date: string;
  plan_status: string;
  plan_type: string;
  createdAt: string;
  updatedAt: string;
}

interface Checker {
  id: string;
  username: string;
  organizationId: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Inbound {
  id: string;
  inbound_plan_id: string;
  inbound_plan: InboundPlan;
  checker_leader: Checker;
  checkers: Checker[];
  status: string;
  assign_date_start: string;
  assign_date_finish: string;
  createdAt: string;
  updatedAt: string;
}

interface OutboundResponse {
  success: boolean;
  message: string;
  data: Inbound[];
  timestamp: string;
  path: string;
}

interface OutboundState {
  outbound: OutboundResponse | null;
  setOutbound: (outbound: OutboundResponse) => void;
  getOutbound: () => void;
  clearOutbound: () => void;
}

const useOutboundStore = create<OutboundState>((set) => ({
  outbound: null,
  setOutbound: async (outbound) => {
    await AsyncStorage.setItem('outbound', JSON.stringify(outbound));
    set({ outbound });
  },
  getOutbound: async () => {
    const storedOutbound = await AsyncStorage.getItem('outbound');
    set({ outbound: storedOutbound ? JSON.parse(storedOutbound) : [] });
  },
  clearOutbound: async () => {
    await AsyncStorage.removeItem('outbound');
    set({ outbound: null});
  },
}));

export default useOutboundStore;
