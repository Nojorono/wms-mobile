import { create } from 'zustand';

interface LoadingDialogState {
    visible: boolean;
    message: string;
    showLoadingDialog: (message: string) => void;
    hideLoadingDialog: () => void;
    setLoadingMessage: (message: string) => void; // ✅ tambahan opsional
}

export const useLoadingDialogStore = create<LoadingDialogState>((set) => ({
    visible: false,
    message: 'Loading...',
    showLoadingDialog: (message) => set({ visible: true, message }),
    hideLoadingDialog: () => set({ visible: false, message: '' }),
    setLoadingMessage: (message) => set({ message }), // ✅ tidak ubah visible
}));