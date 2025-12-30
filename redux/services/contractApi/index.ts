// contractApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "../baseQuery";
import type {
  EmployeeContract,
  CreateContractRequest,
  UpdateContractRequest,
  TerminateContractRequest,
  ContractStats,
  ExpiringContractsResponse,
} from "../../types/contract.type";

export const contractApi = createApi({
  reducerPath: "contractApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["EmployeeContract", "ContractStats", "ExpiringContracts"],
  endpoints: (builder) => ({
    // Create new employee contract
    createEmployeeContract: builder.mutation<
      EmployeeContract,
      { userId: number; data: CreateContractRequest }
    >({
      query: ({ userId, data }) => ({
        url: `/employee-contracts/${userId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EmployeeContract", "ContractStats"],
    }),

    // Get contract by ID
    getContractById: builder.query<EmployeeContract, number>({
      query: (contractId) => `/employee-contracts/${contractId}`,
      providesTags: (result, error, id) => [{ type: "EmployeeContract", id }],
    }),

    // Get all contracts for a user
    getUserContracts: builder.query<EmployeeContract[], number | string>({
      query: (userId) => `/employee-contracts/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "EmployeeContract" as const,
                id,
              })),
              "EmployeeContract",
            ]
          : ["EmployeeContract"],
    }),

    // Get active contract for a user
    getActiveContract: builder.query<EmployeeContract, number | string>({
      query: (userId) => `/employee-contracts/user/${userId}/active`,
      providesTags: (result) =>
        result ? [{ type: "EmployeeContract", id: result.id }] : [],
    }),

    // Update contract
    updateContract: builder.mutation<
      EmployeeContract,
      { contractId: number; data: UpdateContractRequest }
    >({
      query: ({ contractId, data }) => ({
        url: `/employee-contracts/${contractId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { contractId }) => [
        { type: "EmployeeContract", id: contractId },
        "ContractStats",
      ],
    }),

    // Terminate contract
    terminateContract: builder.mutation<
      EmployeeContract,
      { contractId: number; data: TerminateContractRequest }
    >({
      query: ({ contractId, data }) => ({
        url: `/employee-contracts/${contractId}/terminate`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { contractId }) => [
        { type: "EmployeeContract", id: contractId },
        "ContractStats",
      ],
    }),

    // Get contracts expiring soon
    getExpiringContracts: builder.query<
      ExpiringContractsResponse,
      { days: number }
    >({
      query: ({ days }) => ({
        url: "/employee-contracts/expiring-soon",
        params: { days },
      }),
      providesTags: ["ExpiringContracts"],
    }),

    // Delete contract
    deleteContract: builder.mutation<void, number>({
      query: (contractId) => ({
        url: `/employee-contracts/${contractId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeContract", "ContractStats"],
    }),

    // Get contract statistics (if you have such an endpoint)
    getContractStats: builder.query<ContractStats, void>({
      query: () => "/employee-contracts/stats",
      providesTags: ["ContractStats"],
    }),
  }),
});

// Export hooks
export const {
  useCreateEmployeeContractMutation,
  useGetContractByIdQuery,
  useLazyGetContractByIdQuery,
  useGetUserContractsQuery,
  useLazyGetUserContractsQuery,
  useGetActiveContractQuery,
  useLazyGetActiveContractQuery,
  useUpdateContractMutation,
  useTerminateContractMutation,
  useGetExpiringContractsQuery,
  useLazyGetExpiringContractsQuery,
  useDeleteContractMutation,
  useGetContractStatsQuery,
  useLazyGetContractStatsQuery,
} = contractApi;
