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

interface InboundResponse {
  success: boolean;
  message: string;
  data: Inbound[];
  timestamp: string;
  path: string;
}

interface InboundState {
  putAway: InboundResponse | null;
  setPutAway: (inbound: InboundResponse) => void;
  getPutAway: () => void;
  clearPutAway: () => void;
}

const usePutAwayStore = create<InboundState>((set) => ({
  putAway: null,
  setPutAway: async (putAway) => {
    await AsyncStorage.setItem('putaway', JSON.stringify(putAway));
    set({ putAway });
  },
  getPutAway: async () => {
    const storedInbound = await AsyncStorage.getItem('putaway');
    set({ putAway: storedInbound ? JSON.parse(storedInbound) : [] });
  },
  clearPutAway: async () => {
    await AsyncStorage.removeItem('putaway');
    set({ putAway: null});
  },
}));

export default usePutAwayStore;
