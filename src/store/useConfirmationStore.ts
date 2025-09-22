import { create } from "zustand";

type ConfirmationType = "accept" | "decline" | null;

type State = {
  visible: boolean;
  type: ConfirmationType;
  message: string;
  requireReason: boolean; // << baru
  onConfirm?: (reason?: string) => void;
};

type Actions = {
  show: (
    type: ConfirmationType,
    message: string,
    onConfirm?: (reason?: string) => void,
    requireReason?: boolean // << baru
  ) => void;
  hide: () => void;
};

export const useConfirmationStore = create<State & Actions>((set) => ({
  visible: false,
  type: null,
  message: "",
  requireReason: false,
  onConfirm: undefined,

  show: (type, message, onConfirm, requireReason = false) =>
    set({ visible: true, type, message, onConfirm, requireReason }),
  hide: () =>
    set({
      visible: false,
      type: null,
      message: "",
      requireReason: false,
      onConfirm: undefined,
    }),
}));
