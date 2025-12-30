// contract.type.ts
export interface EmployeeContract {
  id: number;
  userId: number;
  employeeStatus: "EMPLOYEED" | "CONTRACT_TERMINATED" | "RESIGNED" | "ON_LEAVE";
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  department: string;
  designation: string;
  position: string;
  reportingHr: string;
  reportingManager: string;
  reportingTeamLead: string;
  joiningDate: string;
  contractStart: string;
  contractEnd: string;
  terminationDate?: string;
  shift: "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE";
  workLocation: "ON_SITE" | "REMOTE" | "HYBRID";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractRequest {
  employeeStatus: EmployeeContract["employeeStatus"];
  jobType: EmployeeContract["jobType"];
  department: string;
  designation: string;
  position: string;
  reportingHr: string;
  reportingManager: string;
  reportingTeamLead: string;
  joiningDate: string;
  contractStart: string;
  contractEnd: string;
  shift: EmployeeContract["shift"];
  workLocation: EmployeeContract["workLocation"];
}

export interface UpdateContractRequest {
  employeeStatus?: EmployeeContract["employeeStatus"];
  jobType?: EmployeeContract["jobType"];
  department?: string;
  designation?: string;
  position?: string;
  reportingHr?: string;
  reportingManager?: string;
  reportingTeamLead?: string;
  joiningDate?: string;
  contractStart?: string;
  contractEnd?: string;
  shift?: EmployeeContract["shift"];
  workLocation?: EmployeeContract["workLocation"];
  terminationDate?: string;
}

export interface TerminateContractRequest {
  terminationDate: string;
}

export interface ContractStats {
  total: number;
  active: number;
  expiringSoon: number;
  terminated: number;
}

export interface ExpiringContractsResponse {
  contracts: EmployeeContract[];
  daysThreshold: number;
  totalCount: number;
}
