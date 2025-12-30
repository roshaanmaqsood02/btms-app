// educationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { educationApi } from "../../services/educationApi";
import { Education, EducationStats } from "@/redux/types/education.type";

interface EducationState {
  currentEducation: Education | null;
  userEducations: Education[];
  stats: EducationStats | null;
  isLoading: boolean;
  error: string | null;
  selectedEducationId: number | null;
}

const initialState: EducationState = {
  currentEducation: null,
  userEducations: [],
  stats: null,
  isLoading: false,
  error: null,
  selectedEducationId: null,
};

// SSR-safe localStorage helpers
const getStoredEducation = (): Education | null => {
  if (typeof window !== "undefined") {
    const educationStr = localStorage.getItem("currentEducation");
    try {
      return educationStr ? JSON.parse(educationStr) : null;
    } catch (error) {
      console.error("Failed to parse stored education:", error);
      localStorage.removeItem("currentEducation");
      return null;
    }
  }
  return null;
};

const setStorage = (education: Education | null) => {
  if (typeof window !== "undefined") {
    if (education) {
      localStorage.setItem("currentEducation", JSON.stringify(education));
    } else {
      localStorage.removeItem("currentEducation");
    }
  }
};

const clearStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentEducation");
  }
};

const educationSlice = createSlice({
  name: "education",
  initialState: {
    ...initialState,
    currentEducation: getStoredEducation(),
  },
  reducers: {
    setCurrentEducation: (state, action: PayloadAction<Education>) => {
      state.currentEducation = action.payload;
      state.error = null;
      setStorage(action.payload);
    },

    setUserEducations: (state, action: PayloadAction<Education[]>) => {
      state.userEducations = action.payload;
      state.error = null;
    },

    setEducationStats: (state, action: PayloadAction<EducationStats>) => {
      state.stats = action.payload;
      state.error = null;
    },

    setSelectedEducationId: (state, action: PayloadAction<number | null>) => {
      state.selectedEducationId = action.payload;
    },

    updateEducationInList: (state, action: PayloadAction<Education>) => {
      const index = state.userEducations.findIndex(
        (e) => e.id === action.payload.id
      );
      if (index !== -1) {
        state.userEducations[index] = action.payload;
      }

      if (state.currentEducation?.id === action.payload.id) {
        state.currentEducation = action.payload;
        setStorage(action.payload);
      }
    },

    removeEducationFromList: (state, action: PayloadAction<number>) => {
      state.userEducations = state.userEducations.filter(
        (e) => e.id !== action.payload
      );

      if (state.currentEducation?.id === action.payload) {
        state.currentEducation = null;
        clearStorage();
      }

      if (state.selectedEducationId === action.payload) {
        state.selectedEducationId = null;
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

    clearCurrentEducation: (state) => {
      state.currentEducation = null;
      clearStorage();
    },

    resetEducationState: () => {
      clearStorage();
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Handle successful education creation
    builder.addMatcher(
      educationApi.endpoints.createEducation.matchFulfilled,
      (state, action) => {
        state.currentEducation = action.payload;
        state.userEducations.push(action.payload);
        state.isLoading = false;
        state.error = null;
        setStorage(action.payload);
      }
    );

    // Handle successful education fetch by ID
    builder.addMatcher(
      educationApi.endpoints.getEducationById.matchFulfilled,
      (state, action) => {
        state.currentEducation = action.payload;
        state.isLoading = false;
        state.error = null;
        setStorage(action.payload);
      }
    );

    // Handle successful user educations fetch
    builder.addMatcher(
      educationApi.endpoints.getUserEducations.matchFulfilled,
      (state, action) => {
        state.userEducations = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful education update
    builder.addMatcher(
      educationApi.endpoints.updateEducation.matchFulfilled,
      (state, action) => {
        const index = state.userEducations.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.userEducations[index] = action.payload;
        }

        if (state.currentEducation?.id === action.payload.id) {
          state.currentEducation = action.payload;
          setStorage(action.payload);
        }

        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful education deletion
    builder.addMatcher(
      educationApi.endpoints.deleteEducation.matchFulfilled,
      (state, action) => {
        const educationId = action.meta.arg.originalArgs;
        state.userEducations = state.userEducations.filter(
          (e) => e.id !== educationId
        );

        if (state.currentEducation?.id === educationId) {
          state.currentEducation = null;
          clearStorage();
        }

        if (state.selectedEducationId === educationId) {
          state.selectedEducationId = null;
        }

        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle successful stats fetch
    builder.addMatcher(
      educationApi.endpoints.getEducationStats.matchFulfilled,
      (state, action) => {
        state.stats = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );

    // Handle loading states for education endpoints
    builder.addMatcher(
      educationApi.endpoints.createEducation.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      educationApi.endpoints.updateEducation.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      educationApi.endpoints.deleteEducation.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );

    // Handle error states for education endpoints
    builder.addMatcher(
      educationApi.endpoints.createEducation.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to create education record";
      }
    );

    builder.addMatcher(
      educationApi.endpoints.updateEducation.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to update education record";
      }
    );

    builder.addMatcher(
      educationApi.endpoints.deleteEducation.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to delete education record";
      }
    );

    // Handle error states for query endpoints
    builder.addMatcher(
      educationApi.endpoints.getEducationById.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch education record";
      }
    );

    builder.addMatcher(
      educationApi.endpoints.getUserEducations.matchRejected,
      (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch user education records";
      }
    );
  },
});

export const {
  setCurrentEducation,
  setUserEducations,
  setEducationStats,
  setSelectedEducationId,
  updateEducationInList,
  removeEducationFromList,
  setLoading,
  setError,
  clearError,
  clearCurrentEducation,
  resetEducationState,
} = educationSlice.actions;

export default educationSlice.reducer;

// Selectors
export const selectCurrentEducation = (state: { education: EducationState }) =>
  state.education.currentEducation;
export const selectUserEducations = (state: { education: EducationState }) =>
  state.education.userEducations;
export const selectEducationStats = (state: { education: EducationState }) =>
  state.education.stats;
export const selectSelectedEducationId = (state: {
  education: EducationState;
}) => state.education.selectedEducationId;
export const selectEducationLoading = (state: { education: EducationState }) =>
  state.education.isLoading;
export const selectEducationError = (state: { education: EducationState }) =>
  state.education.error;

// Helper selectors
export const selectEducationById =
  (educationId: number) => (state: { education: EducationState }) =>
    state.education.userEducations.find((e) => e.id === educationId) ||
    (state.education.currentEducation?.id === educationId
      ? state.education.currentEducation
      : null);

export const selectEducationsByInstitution =
  (institution: string) => (state: { education: EducationState }) =>
    state.education.userEducations.filter(
      (e) => e.institution.toLowerCase() === institution.toLowerCase()
    );

export const selectEducationsByDegree =
  (degree: string) => (state: { education: EducationState }) =>
    state.education.userEducations.filter(
      (e) => e.degree.toLowerCase() === degree.toLowerCase()
    );

export const selectEducationsSortedByYear = (state: {
  education: EducationState;
}) =>
  [...state.education.userEducations].sort((a, b) => b.startYear - a.startYear);
