export const canEditUsers = (role?: string | null) =>
  role === "HRM" || role === "OPERATION_MANAGER";

export const canViewContract = (role?: string | null) =>
  role === "HRM" || role === "OPERATION_MANAGER";

export const canDeleteUsers = (role?: string | null) =>
  role === "HRM" || role === "OPERATION_MANAGER";
