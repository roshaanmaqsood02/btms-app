// contractSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { contractApi } from "../../services/contractApi";
import { EmployeeContract, ContractStats } from "@/redux/types/contract.type";

interface ContractState {
  currentContract: EmployeeContract | null;
  userContracts: EmployeeContract[];
  activeContract: EmployeeContract | null;
  expiringContracts: EmployeeContract[];
  stats: ContractStats | null;
  isLoading: boolean;
  error: string | null;
  selectedContractId: number | null;
}

const initialState: ContractState = {
  currentContract: null,
  userContracts: [],
  activeContract: null,
  expiringContracts: [],
  stats: null,
  isLoading: false,
  error: null,
  selectedContractId: null,
};

// SSR-safe localStorage helpers
const getStoredContract = (): EmployeeContract | null => {
  if (typeof window !== "undefined") {
    const contractStr = localStorage.getItem("currentContract");
    try {
      return contractStr ? JSON.parse(contractStr) : null;
    } catch (error) {
      console.error("Failed to parse stored contract:", error);
      localStorage.removeItem("currentContract");
      return null;
    }
  }
  return null;
};

const setStorage = (contract: EmployeeContract | null) => {
  if (typeof window !== "undefined") {
    if (contract) {
      localStorage.setItem("currentContract", JSON.stringify(contract));
    } else {
      localStorage.removeItem("currentContract");
    }
  }
};

const clearStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentContract");
  }
};

const contractSlice = createSlice({
  name: "contract",
  initialState: {
    ...initialState,
    currentContract: getStoredContract(),
  },
  reducers: {
    setCurrentContract: (state, action: PayloadAction<EmployeeContract>) => {
      state.currentContract = action.payload;
      state.error = null;
      setStorage(action.payload);
    },

    setUserContracts: (state, action: PayloadAction<EmployeeContract[]>) => {
      state.userContracts = action.payload;
      state.error = null;
    },

    setActiveContract: (state, action: PayloadAction<EmployeeContract>) => {
      state.activeContract = action.payload;
      state.error = null;
    },

    setExpiringContracts: (
      state,
      action: PayloadAction<EmployeeContract[]>
    ) => {
      state.expiringContracts = action.payload;
      state.error = null;
    },

    setContractStats: (state, action: PayloadAction<ContractStats>) => {
      state.stats = action.payload;
      state.error = null;
    },

    setSelectedContractId: (state, action: PayloadAction<number | null>) => {
      state.selectedContractId = action.payload;
    },

    updateContractInList: (state, action: PayloadAction<EmployeeContract>) => {
      const index = state.userContracts.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.userContracts[index] = action.payload;
      }

      if (state.currentContract?.id === action.payload.id) {
        state.currentContract = action.payload;
        setStorage(action.payload);
      }

      if (state.activeContract?.id === action.payload.id) {
        state.activeContract = action.payload;
      }
    },

    removeContractFromList: (state, action: PayloadAction<number>) => {
      state.userContracts = state.userContracts.filter(
        (c) => c.id !== action.payload
      );

      if (state.currentContract?.id === action.payload) {
        state.currentContract = null;
        clearStorage();
      }

      if (state.activeContract?.id === action.payload) {
        state.activeContract = null;
      }

      if (state.selectedContractId === action.payload) {
        state.selectedContractId = null;
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearCurrentContract: (state) => {
      state.currentContract = null;
      clearStorage();
    },

    resetContractState: () => {
      clearStorage();
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Handle successful contract creation
    builder.addMatcher(
      contractApi.endpoints.createEmployeeContract.matchFulfilled,
      (state, action) => {
        state.currentContract = action.payload;
        state.userContracts.push(action.payload);
        state.isLoading = false;
        state.error = null;

        // If this is the first contract or active, set as active
        if (action.payload.isActive && !state.activeContract) {
          state.activeContract = action.payload;
        }

        setStorage(action.payload);
      }
    );

    // Handle successful contract fetch by ID
    builder.addMatcher(
      contractApi.endpoints.getContractById.matchFulfilled,
      (state, action) => {
        state.currentContract = action.payload;
        state.isLoading = false;
        state.error = null;
        setStorage(action.payload);
      }
    );

    // Handle successful user contracts fetch
    builder.addMatcher(
      contractApi.endpoints.getUserContracts.matchFulfilled,
      (state, action) => {
        state.userContracts = action.payload;
        state.isLoading = false;
        state.error = null;

        // Find active contract from the list
        const active = action.payload.find((contract) => contract.isActive);
        if (active) {
          state.activeContract = active;
        }
      }
    );

    // Handle successful active contract fetch
    builder.addMatcher(
      contractApi.endpoints.getActiveContract.matchFulfilled,
      (state, action) => {
        state.activeContract = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful contract update
    builder.addMatcher(
      contractApi.endpoints.updateContract.matchFulfilled,
      (state, action) => {
        const index = state.userContracts.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.userContracts[index] = action.payload;
        }

        if (state.currentContract?.id === action.payload.id) {
          state.currentContract = action.payload;
          setStorage(action.payload);
        }

        if (state.activeContract?.id === action.payload.id) {
          state.activeContract = action.payload;
        }

        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful contract termination
    builder.addMatcher(
      contractApi.endpoints.terminateContract.matchFulfilled,
      (state, action) => {
        const index = state.userContracts.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.userContracts[index] = action.payload;
        }

        if (state.currentContract?.id === action.payload.id) {
          state.currentContract = action.payload;
          setStorage(action.payload);
        }

        if (state.activeContract?.id === action.payload.id) {
          state.activeContract = null; // Remove from active since it's terminated
        }

        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful expiring contracts fetch
    builder.addMatcher(
      contractApi.endpoints.getExpiringContracts.matchFulfilled,
      (state, action) => {
        state.expiringContracts = action.payload.contracts;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful contract deletion
    builder.addMatcher(
      contractApi.endpoints.deleteContract.matchFulfilled,
      (state, action) => {
        const contractId = action.meta.arg.originalArgs;
        state.userContracts = state.userContracts.filter(
          (c) => c.id !== contractId
        );

        if (state.currentContract?.id === contractId) {
          state.currentContract = null;
          clearStorage();
        }

        if (state.activeContract?.id === contractId) {
          state.activeContract = null;
        }

        if (state.selectedContractId === contractId) {
          state.selectedContractId = null;
        }

        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful stats fetch
    builder.addMatcher(
      contractApi.endpoints.getContractStats.matchFulfilled,
      (state, action) => {
        state.stats = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle loading states for contract endpoints
    builder.addMatcher(
      contractApi.endpoints.createEmployeeContract.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      contractApi.endpoints.updateContract.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      contractApi.endpoints.terminateContract.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      contractApi.endpoints.deleteContract.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    // Handle error states for contract endpoints
    builder.addMatcher(
      contractApi.endpoints.createEmployeeContract.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to create contract";
      }
    );

    builder.addMatcher(
      contractApi.endpoints.updateContract.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to update contract";
      }
    );

    builder.addMatcher(
      contractApi.endpoints.terminateContract.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to terminate contract";
      }
    );

    builder.addMatcher(
      contractApi.endpoints.deleteContract.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to delete contract";
      }
    );

    // Handle error states for query endpoints
    builder.addMatcher(
      contractApi.endpoints.getContractById.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch contract";
      }
    );

    builder.addMatcher(
      contractApi.endpoints.getUserContracts.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch user contracts";
      }
    );

    builder.addMatcher(
      contractApi.endpoints.getActiveContract.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch active contract";
      }
    );
  },
});

export const {
  setCurrentContract,
  setUserContracts,
  setActiveContract,
  setExpiringContracts,
  setContractStats,
  setSelectedContractId,
  updateContractInList,
  removeContractFromList,
  setLoading,
  setError,
  clearError,
  clearCurrentContract,
  resetContractState,
} = contractSlice.actions;

export default contractSlice.reducer;

// Selectors
export const selectCurrentContract = (state: { contract: ContractState }) =>
  state.contract.currentContract;
export const selectUserContracts = (state: { contract: ContractState }) =>
  state.contract.userContracts;
export const selectActiveContract = (state: { contract: ContractState }) =>
  state.contract.activeContract;
export const selectExpiringContracts = (state: { contract: ContractState }) =>
  state.contract.expiringContracts;
export const selectContractStats = (state: { contract: ContractState }) =>
  state.contract.stats;
export const selectSelectedContractId = (state: { contract: ContractState }) =>
  state.contract.selectedContractId;
export const selectContractLoading = (state: { contract: ContractState }) =>
  state.contract.isLoading;
export const selectContractError = (state: { contract: ContractState }) =>
  state.contract.error;

// Helper selectors
export const selectContractById =
  (contractId: number) => (state: { contract: ContractState }) =>
    state.contract.userContracts.find((c) => c.id === contractId) ||
    (state.contract.currentContract?.id === contractId
      ? state.contract.currentContract
      : null);

export const selectActiveContracts = (state: { contract: ContractState }) =>
  state.contract.userContracts.filter((c) => c.isActive);

export const selectTerminatedContracts = (state: { contract: ContractState }) =>
  state.contract.userContracts.filter((c) => !c.isActive);
