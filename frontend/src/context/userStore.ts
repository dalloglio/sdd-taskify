import { create } from 'zustand';
import { User } from '../types/models';

type State = {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
};

export const useUserStore = create<State>((set) => ({
  currentUser: null,
  setCurrentUser: (u) => set({ currentUser: u }),
}));

export default useUserStore;
