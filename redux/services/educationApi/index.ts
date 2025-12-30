// educationApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../baseQuery";
import type {
  Education,
  CreateEducationRequest,
  UpdateEducationRequest,
  EducationStats,
} from "../../types/education.type";

export const educationApi = createApi({
  reducerPath: "educationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Education", "EducationStats"],
  endpoints: (builder) => ({
    // Create new education record
    createEducation: builder.mutation<
      Education,
      { userId: number; data: CreateEducationRequest }
    >({
      query: ({ userId, data }) => ({
        url: `/educations/${userId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Education", "EducationStats"],
    }),

    // Get education by ID
    getEducationById: builder.query<Education, number>({
      query: (educationId) => `/educations/${educationId}`,
      providesTags: (result, error, id) => [{ type: "Education", id }],
    }),

    // Get all education records for a user
    getUserEducations: builder.query<Education[], number | string>({
      query: (userId) => `/educations/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Education" as const,
                id,
              })),
              "Education",
            ]
          : ["Education"],
    }),

    // Update education record
    updateEducation: builder.mutation<
      Education,
      { educationId: number; data: UpdateEducationRequest }
    >({
      query: ({ educationId, data }) => ({
        url: `/educations/${educationId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { educationId }) => [
        { type: "Education", id: educationId },
        "EducationStats",
      ],
    }),

    // Delete education record
    deleteEducation: builder.mutation<void, number>({
      query: (educationId) => ({
        url: `/educations/${educationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Education", "EducationStats"],
    }),

    // Get education statistics (if you have such an endpoint)
    getEducationStats: builder.query<EducationStats, void>({
      query: () => "/educations/stats",
      providesTags: ["EducationStats"],
    }),
  }),
});

// Export hooks
export const {
  useCreateEducationMutation,
  useGetEducationByIdQuery,
  useLazyGetEducationByIdQuery,
  useGetUserEducationsQuery,
  useLazyGetUserEducationsQuery,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
  useGetEducationStatsQuery,
  useLazyGetEducationStatsQuery,
} = educationApi;
