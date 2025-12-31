import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { assetApi } from "../../services/assetApi";
import { Asset, AssetStats } from "@/redux/types/asset.type";

interface AssetState {
  currentAsset: Asset | null;
  userAssets: Asset[];
  allAssets: Asset[];
  availableAssets: Asset[];
  assignedAssets: Asset[];
  stats: AssetStats | null;
  isLoading: boolean;
  error: string | null;
  selectedAssetId: number | null;
}

const initialState: AssetState = {
  currentAsset: null,
  userAssets: [],
  allAssets: [],
  availableAssets: [],
  assignedAssets: [],
  stats: null,
  isLoading: false,
  error: null,
  selectedAssetId: null,
};

// SSR-safe localStorage helpers
const getStoredAsset = (): Asset | null => {
  if (typeof window !== "undefined") {
    const assetStr = localStorage.getItem("currentAsset");
    try {
      return assetStr ? JSON.parse(assetStr) : null;
    } catch (error) {
      console.error("Failed to parse stored asset:", error);
      localStorage.removeItem("currentAsset");
      return null;
    }
  }
  return null;
};

const setStorage = (asset: Asset | null) => {
  if (typeof window !== "undefined") {
    if (asset) {
      localStorage.setItem("currentAsset", JSON.stringify(asset));
    } else {
      localStorage.removeItem("currentAsset");
    }
  }
};

const clearStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentAsset");
  }
};

const assetSlice = createSlice({
  name: "asset",
  initialState: {
    ...initialState,
    currentAsset: getStoredAsset(),
  },
  reducers: {
    setCurrentAsset: (state, action: PayloadAction<Asset>) => {
      state.currentAsset = action.payload;
      state.error = null;
      setStorage(action.payload);
    },

    setUserAssets: (state, action: PayloadAction<Asset[]>) => {
      state.userAssets = action.payload;
      state.error = null;
    },

    setAllAssets: (state, action: PayloadAction<Asset[]>) => {
      state.allAssets = action.payload;
      state.error = null;
    },

    setAvailableAssets: (state, action: PayloadAction<Asset[]>) => {
      state.availableAssets = action.payload;
      state.error = null;
    },

    setAssignedAssets: (state, action: PayloadAction<Asset[]>) => {
      state.assignedAssets = action.payload;
      state.error = null;
    },

    setAssetStats: (state, action: PayloadAction<AssetStats>) => {
      state.stats = action.payload;
      state.error = null;
    },

    setSelectedAssetId: (state, action: PayloadAction<number | null>) => {
      state.selectedAssetId = action.payload;
    },

    updateAssetInList: (state, action: PayloadAction<Asset>) => {
      // Update in userAssets
      const userIndex = state.userAssets.findIndex(
        (a) => a.id === action.payload.id
      );
      if (userIndex !== -1) {
        state.userAssets[userIndex] = action.payload;
      }

      // Update in allAssets
      const allIndex = state.allAssets.findIndex(
        (a) => a.id === action.payload.id
      );
      if (allIndex !== -1) {
        state.allAssets[allIndex] = action.payload;
      }

      // Update in availableAssets or assignedAssets based on isReturned status
      if (action.payload.isReturned) {
        const assignedIndex = state.assignedAssets.findIndex(
          (a) => a.id === action.payload.id
        );
        if (assignedIndex !== -1) {
          state.assignedAssets.splice(assignedIndex, 1);
        }

        const availIndex = state.availableAssets.findIndex(
          (a) => a.id === action.payload.id
        );
        if (availIndex === -1) {
          state.availableAssets.push(action.payload);
        } else {
          state.availableAssets[availIndex] = action.payload;
        }
      } else {
        const availableIndex = state.availableAssets.findIndex(
          (a) => a.id === action.payload.id
        );
        if (availableIndex !== -1) {
          state.availableAssets.splice(availableIndex, 1);
        }

        const assignedIndex = state.assignedAssets.findIndex(
          (a) => a.id === action.payload.id
        );
        if (assignedIndex === -1) {
          state.assignedAssets.push(action.payload);
        } else {
          state.assignedAssets[assignedIndex] = action.payload;
        }
      }

      if (state.currentAsset?.id === action.payload.id) {
        state.currentAsset = action.payload;
        setStorage(action.payload);
      }
    },

    removeAssetFromList: (state, action: PayloadAction<number>) => {
      const assetId = action.payload;

      state.userAssets = state.userAssets.filter((a) => a.id !== assetId);
      state.allAssets = state.allAssets.filter((a) => a.id !== assetId);
      state.availableAssets = state.availableAssets.filter(
        (a) => a.id !== assetId
      );
      state.assignedAssets = state.assignedAssets.filter(
        (a) => a.id !== assetId
      );

      if (state.currentAsset?.id === assetId) {
        state.currentAsset = null;
        clearStorage();
      }

      if (state.selectedAssetId === assetId) {
        state.selectedAssetId = null;
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

    clearCurrentAsset: (state) => {
      state.currentAsset = null;
      clearStorage();
    },

    resetAssetState: () => {
      clearStorage();
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Handle successful asset assignment
    builder.addMatcher(
      assetApi.endpoints.assignAsset.matchFulfilled,
      (state, action) => {
        state.currentAsset = action.payload;
        state.userAssets.push(action.payload);
        state.allAssets.push(action.payload);
        state.assignedAssets.push(action.payload);
        state.isLoading = false;
        state.error = null;
        setStorage(action.payload);
      }
    );

    // Handle successful asset fetch by ID
    builder.addMatcher(
      assetApi.endpoints.getAssetById.matchFulfilled,
      (state, action) => {
        state.currentAsset = action.payload;
        state.isLoading = false;
        state.error = null;
        setStorage(action.payload);
      }
    );

    // Handle successful user assets fetch
    builder.addMatcher(
      assetApi.endpoints.getUserAssets.matchFulfilled,
      (state, action) => {
        state.userAssets = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful all assets fetch
    builder.addMatcher(
      assetApi.endpoints.getAllAssets.matchFulfilled,
      (state, action) => {
        state.allAssets = action.payload;
        // Separate available and assigned assets
        state.availableAssets = action.payload.filter(
          (asset) => asset.isReturned
        );
        state.assignedAssets = action.payload.filter(
          (asset) => !asset.isReturned
        );
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful available assets fetch
    builder.addMatcher(
      assetApi.endpoints.getAvailableAssets.matchFulfilled,
      (state, action) => {
        state.availableAssets = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful assigned assets fetch
    builder.addMatcher(
      assetApi.endpoints.getAssignedAssets.matchFulfilled,
      (state, action) => {
        state.assignedAssets = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful asset update
    builder.addMatcher(
      assetApi.endpoints.updateAsset.matchFulfilled,
      (state, action) => {
        // Update asset in all relevant lists
        const updateAssetInArray = (array: Asset[]) => {
          const index = array.findIndex((a) => a.id === action.payload.id);
          if (index !== -1) {
            array[index] = action.payload;
          }
        };

        updateAssetInArray(state.userAssets);
        updateAssetInArray(state.allAssets);
        updateAssetInArray(state.availableAssets);
        updateAssetInArray(state.assignedAssets);

        if (state.currentAsset?.id === action.payload.id) {
          state.currentAsset = action.payload;
          setStorage(action.payload);
        }

        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful asset return
    builder.addMatcher(
      assetApi.endpoints.returnAsset.matchFulfilled,
      (state, action) => {
        // Update asset in userAssets
        const userIndex = state.userAssets.findIndex(
          (a) => a.id === action.payload.id
        );
        if (userIndex !== -1) {
          state.userAssets[userIndex] = action.payload;
        }

        // Update asset in allAssets
        const allIndex = state.allAssets.findIndex(
          (a) => a.id === action.payload.id
        );
        if (allIndex !== -1) {
          state.allAssets[allIndex] = action.payload;
        }

        // Remove from assignedAssets and add to availableAssets
        const assignedIndex = state.assignedAssets.findIndex(
          (a) => a.id === action.payload.id
        );
        if (assignedIndex !== -1) {
          state.assignedAssets.splice(assignedIndex, 1);
        }

        const availIndex = state.availableAssets.findIndex(
          (a) => a.id === action.payload.id
        );
        if (availIndex === -1) {
          state.availableAssets.push(action.payload);
        } else {
          state.availableAssets[availIndex] = action.payload;
        }

        if (state.currentAsset?.id === action.payload.id) {
          state.currentAsset = action.payload;
          setStorage(action.payload);
        }

        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful asset deletion
    builder.addMatcher(
      assetApi.endpoints.deleteAsset.matchFulfilled,
      (state, action) => {
        const assetId = action.meta.arg.originalArgs;

        state.userAssets = state.userAssets.filter((a) => a.id !== assetId);
        state.allAssets = state.allAssets.filter((a) => a.id !== assetId);
        state.availableAssets = state.availableAssets.filter(
          (a) => a.id !== assetId
        );
        state.assignedAssets = state.assignedAssets.filter(
          (a) => a.id !== assetId
        );

        if (state.currentAsset?.id === assetId) {
          state.currentAsset = null;
          clearStorage();
        }

        if (state.selectedAssetId === assetId) {
          state.selectedAssetId = null;
        }

        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful stats fetch
    builder.addMatcher(
      assetApi.endpoints.getAssetStats.matchFulfilled,
      (state, action) => {
        state.stats = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle loading states for asset endpoints
    builder.addMatcher(assetApi.endpoints.assignAsset.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addMatcher(assetApi.endpoints.updateAsset.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addMatcher(assetApi.endpoints.returnAsset.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addMatcher(assetApi.endpoints.deleteAsset.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    // Handle error states for asset endpoints
    builder.addMatcher(
      assetApi.endpoints.assignAsset.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to assign asset";
      }
    );

    builder.addMatcher(
      assetApi.endpoints.updateAsset.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to update asset";
      }
    );

    builder.addMatcher(
      assetApi.endpoints.returnAsset.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to return asset";
      }
    );

    builder.addMatcher(
      assetApi.endpoints.deleteAsset.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to delete asset";
      }
    );

    // Handle error states for query endpoints
    builder.addMatcher(
      assetApi.endpoints.getAssetById.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch asset";
      }
    );

    builder.addMatcher(
      assetApi.endpoints.getUserAssets.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch user assets";
      }
    );

    builder.addMatcher(
      assetApi.endpoints.getAllAssets.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch all assets";
      }
    );
  },
});

export const {
  setCurrentAsset,
  setUserAssets,
  setAllAssets,
  setAvailableAssets,
  setAssignedAssets,
  setAssetStats,
  setSelectedAssetId,
  updateAssetInList,
  removeAssetFromList,
  setLoading,
  setError,
  clearError,
  clearCurrentAsset,
  resetAssetState,
} = assetSlice.actions;

export default assetSlice.reducer;

// Selectors
export const selectCurrentAsset = (state: { asset: AssetState }) =>
  state.asset.currentAsset;
export const selectUserAssets = (state: { asset: AssetState }) =>
  state.asset.userAssets;
export const selectAllAssets = (state: { asset: AssetState }) =>
  state.asset.allAssets;
export const selectAvailableAssets = (state: { asset: AssetState }) =>
  state.asset.availableAssets;
export const selectAssignedAssets = (state: { asset: AssetState }) =>
  state.asset.assignedAssets;
export const selectAssetStats = (state: { asset: AssetState }) =>
  state.asset.stats;
export const selectSelectedAssetId = (state: { asset: AssetState }) =>
  state.asset.selectedAssetId;
export const selectAssetLoading = (state: { asset: AssetState }) =>
  state.asset.isLoading;
export const selectAssetError = (state: { asset: AssetState }) =>
  state.asset.error;

// Helper selectors
export const selectAssetById =
  (assetId: number) => (state: { asset: AssetState }) =>
    state.asset.allAssets.find((a) => a.id === assetId) ||
    state.asset.userAssets.find((a) => a.id === assetId) ||
    (state.asset.currentAsset?.id === assetId
      ? state.asset.currentAsset
      : null);

export const selectAssetsByType =
  (type: string) => (state: { asset: AssetState }) =>
    state.asset.allAssets.filter(
      (a) => a.type.toLowerCase() === type.toLowerCase()
    );

export const selectAssetsByCompany =
  (company: string) => (state: { asset: AssetState }) =>
    state.asset.allAssets.filter(
      (a) => a.company.toLowerCase() === company.toLowerCase()
    );

export const selectAssetsByUserId =
  (userId: number) => (state: { asset: AssetState }) =>
    state.asset.allAssets.filter((a) => a.userId === userId);

export const selectAssetsWithIssues = (state: { asset: AssetState }) =>
  state.asset.allAssets.filter(
    (a) =>
      a.notes?.toLowerCase().includes("issue") ||
      a.notes?.toLowerCase().includes("damage") ||
      a.notes?.toLowerCase().includes("repair")
  );
