import { create } from "zustand";
import { StateCreator } from "zustand";

interface StoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

type Store = StateCreator<StoreState, [], [], StoreState>;

const createStore: Store = (
  set: (fn: (state: StoreState) => Partial<StoreState>) => void
) => ({
  count: 0,
  increment: () => set((state: StoreState) => ({ count: state.count + 1 })),
  decrement: () => set((state: StoreState) => ({ count: state.count - 1 })),
});

export const useStore = create<StoreState>(createStore);
