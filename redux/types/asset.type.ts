export interface Asset {
  id: number;
  userId: number;
  type: AssetType;
  assetName: string;
  company: string;
  model: string;
  serialNumber: string;
  screenSize?: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
  macAddress?: string;
  storage?: string;
  assetTag: string;
  notes?: string;
  returnNotes?: string;
  assignedDate?: string;
  returnedDate?: string;
  isReturned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AssetType =
  | "LAPTOP"
  | "DESKTOP"
  | "MONITOR"
  | "PHONE"
  | "TABLET"
  | "ACCESSORY"
  | "OTHER";

export interface CreateAssetRequest {
  type: AssetType;
  assetName: string;
  company: string;
  model: string;
  serialNumber: string;
  screenSize?: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
  macAddress?: string;
  storage?: string;
  assetTag: string;
  notes?: string;
}

export interface UpdateAssetRequest {
  type?: AssetType;
  assetName?: string;
  company?: string;
  model?: string;
  serialNumber?: string;
  screenSize?: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
  macAddress?: string;
  storage?: string;
  assetTag?: string;
  notes?: string;
}

export interface ReturnAssetRequest {
  returnNotes: string;
}

export interface AssetStats {
  total: number;
  assigned: number;
  returned: number;
  byType: Record<AssetType, number>;
  byCompany: Record<string, number>;
}

export interface AssetAssignment {
  assetId: number;
  userId: number;
  assignedDate: string;
  asset: Omit<Asset, "userId" | "assignedDate" | "returnedDate" | "isReturned">;
}
