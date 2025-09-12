// store/useConfirmationStore.ts
import { create } from "zustand";

type ConfirmationType = "accept" | "decline" | null;

type State = {
  visible: boolean;
  type: ConfirmationType;
  message: string;
  onConfirm?: (reason?: string) => void;
};

type Actions = {
  show: (
    type: ConfirmationType,
    message: string,
    onConfirm?: (reason?: string) => void
  ) => void;
  hide: () => void;
};

export const useConfirmationStore = create<State & Actions>((set) => ({
  visible: false,
  type: null,
  message: "",
  onConfirm: undefined,

  show: (type, message, onConfirm) =>
    set({ visible: true, type, message, onConfirm }),
  hide: () => set({ visible: false, type: null, message: "", onConfirm: undefined }),
}));
