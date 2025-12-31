import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
  ReturnAssetRequest,
  AssetStats,
} from "@/redux/types/asset.type";
import baseQueryWithReauth from "../baseQuery";

export const assetApi = createApi({
  reducerPath: "assetApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Asset", "AssetStats", "UserAssets"],
  endpoints: (builder) => ({
    // Assign asset to user
    assignAsset: builder.mutation<
      Asset,
      { userId: number; assetId: number; data: CreateAssetRequest }
    >({
      query: ({ userId, data }) => ({
        url: `/assets/${userId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Asset", "AssetStats", "UserAssets"],
    }),

    // Get asset by ID
    getAssetById: builder.query<Asset, number>({
      query: (assetId) => `/assets/${assetId}`,
      providesTags: (result, error, id) => [{ type: "Asset", id }],
    }),

    // Get all assets for a user
    getUserAssets: builder.query<Asset[], number | string>({
      query: (userId) => `/assets/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Asset" as const,
                id,
              })),
              { type: "UserAssets", id: "LIST" },
            ]
          : [{ type: "UserAssets", id: "LIST" }],
    }),

    // Update asset
    updateAsset: builder.mutation<
      Asset,
      { assetId: number; data: UpdateAssetRequest }
    >({
      query: ({ assetId, data }) => ({
        url: `/assets/${assetId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { assetId }) => [
        { type: "Asset", id: assetId },
        { type: "UserAssets", id: "LIST" },
      ],
    }),

    // Return asset
    returnAsset: builder.mutation<
      Asset,
      { assetId: number; data: ReturnAssetRequest }
    >({
      query: ({ assetId, data }) => ({
        url: `/assets/${assetId}/return`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { assetId }) => [
        { type: "Asset", id: assetId },
        { type: "UserAssets", id: "LIST" },
        "AssetStats",
      ],
    }),

    // Delete asset
    deleteAsset: builder.mutation<void, number>({
      query: (assetId) => ({
        url: `/assets/${assetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Asset", "AssetStats", "UserAssets"],
    }),

    // Get all assets (if you have such an endpoint)
    getAllAssets: builder.query<Asset[], void>({
      query: () => "/assets",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Asset" as const,
                id,
              })),
              "Asset",
            ]
          : ["Asset"],
    }),

    // Get asset statistics (if you have such an endpoint)
    getAssetStats: builder.query<AssetStats, void>({
      query: () => "/assets/stats",
      providesTags: ["AssetStats"],
    }),

    // Get available assets (not assigned to any user)
    getAvailableAssets: builder.query<Asset[], void>({
      query: () => "/assets/available",
      providesTags: ["Asset"],
    }),

    // Get assigned assets
    getAssignedAssets: builder.query<Asset[], void>({
      query: () => "/assets/assigned",
      providesTags: ["Asset"],
    }),
  }),
});

// Export hooks
export const {
  useAssignAssetMutation,
  useGetAssetByIdQuery,
  useLazyGetAssetByIdQuery,
  useGetUserAssetsQuery,
  useLazyGetUserAssetsQuery,
  useUpdateAssetMutation,
  useReturnAssetMutation,
  useDeleteAssetMutation,
  useGetAllAssetsQuery,
  useLazyGetAllAssetsQuery,
  useGetAssetStatsQuery,
  useLazyGetAssetStatsQuery,
  useGetAvailableAssetsQuery,
  useLazyGetAvailableAssetsQuery,
  useGetAssignedAssetsQuery,
  useLazyGetAssignedAssetsQuery,
} = assetApi;
