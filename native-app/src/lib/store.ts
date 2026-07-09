import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// Define the User Profile structure
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  storeId: string;
  branchId: string | null;
  warehouseId: string | null;
  [key: string]: any;
}

// Define the state schema
interface AuthState {
  // Tenant Discovery Settings
  storeId: string | null;
  storeName: string | null;
  apiBaseUrl: string | null;

  // Session & Authentication
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;

  // Active Working Scopes (Session locks)
  activeBranchId: string | null;
  activeWarehouseId: string | null;

  // Setters/Actions
  setTenantInfo: (storeId: string, apiBaseUrl: string, storeName: string) => void;
  setLoginData: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  setScopes: (activeBranchId: string | null, activeWarehouseId: string | null) => void;
  logout: () => void;
}

// Custom storage engine wrapping asynchronous Expo Secure Store
const secureStorageEngine: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (e) {
      console.error('Failed to set secure store value', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Ignore errors
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Default States
      storeId: null,
      storeName: null,
      apiBaseUrl: null,
      token: null,
      refreshToken: null,
      user: null,
      activeBranchId: null,
      activeWarehouseId: null,

      // Setters
      setTenantInfo: (storeId, apiBaseUrl, storeName) => {
        set({ storeId, apiBaseUrl, storeName });
      },

      setLoginData: (user, token, refreshToken) => {
        set({ user, token, refreshToken });
      },

      setScopes: (activeBranchId, activeWarehouseId) => {
        set({ activeBranchId, activeWarehouseId });
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          activeBranchId: null,
          activeWarehouseId: null,
        });
      },
    }),
    {
      name: 'multistore-auth-storage',
      storage: createJSONStorage(() => secureStorageEngine),
    }
  )
);
