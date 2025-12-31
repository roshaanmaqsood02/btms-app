"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  HardDrive,
  Package,
  Calendar,
  Building,
  Hash,
  Cpu,
  Wifi,
  Save,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useGetUserAssetsQuery,
  useDeleteAssetMutation,
  useReturnAssetMutation,
} from "@/redux/services/assetApi";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { useAppSelector } from "@/redux/hook";
import { Asset, AssetType } from "@/redux/types/asset.type";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EditAssetDialog } from "../components/EditAssetDetails";

// Constants
const ALLOWED_EDIT_ROLES = ["ADMIN", "HRM", "OPERATION_MANAGER"];

// Asset type configurations
const ASSET_TYPE_CONFIG: Record<
  AssetType,
  {
    label: string;
    icon: any;
    color: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  LAPTOP: {
    label: "Laptop",
    icon: Laptop,
    color: "text-[#6039BB]x",
    variant: "default",
  },
  DESKTOP: {
    label: "Desktop",
    icon: Monitor,
    color: "text-purple-600",
    variant: "default",
  },
  MONITOR: {
    label: "Monitor",
    icon: Monitor,
    color: "text-indigo-600",
    variant: "secondary",
  },
  PHONE: {
    label: "Phone",
    icon: Smartphone,
    color: "text-green-600",
    variant: "outline",
  },
  TABLET: {
    label: "Tablet",
    icon: Tablet,
    color: "text-orange-600",
    variant: "outline",
  },
  ACCESSORY: {
    label: "Accessory",
    icon: Package,
    color: "text-gray-600",
    variant: "secondary",
  },
  OTHER: {
    label: "Other",
    icon: HardDrive,
    color: "text-slate-600",
    variant: "secondary",
  },
};

// Types
interface AssetsInfoProps {
  userId?: number | string;
  canEdit?: boolean;
  onAssetUpdated?: () => void;
}

interface AssetCardProps {
  asset: Asset;
  canEdit: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReturn?: () => void;
}

// Helper Components
const LoadingState = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: any;
  onRetry: () => void;
}) => (
  <Alert variant="destructive">
    <AlertDescription>
      Failed to load assets information.
      <Button onClick={onRetry} variant="outline" size="sm" className="ml-4">
        Retry
      </Button>
    </AlertDescription>
  </Alert>
);

const NoAssetsState = ({ userId }: { userId: number | string }) => (
  <Alert>
    <AlertDescription>No assets assigned to user ID: {userId}</AlertDescription>
  </Alert>
);

// Helper Functions
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

const getAssetTypeBadge = (type: AssetType) => {
  const config = ASSET_TYPE_CONFIG[type];
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
};

// Asset Card Component
const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  canEdit,
  onEdit,
  onDelete,
  onReturn,
}) => {
  const typeConfig = ASSET_TYPE_CONFIG[asset.type];
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200",
        asset.isReturned && "opacity-60 border-gray-300"
      )}
    >
      {canEdit && (
        <div className="flex justify-end items-center p-0">
          {!asset.isReturned && (
            <>
              <Button onClick={onEdit} variant="ghost" size="sm">
                <Edit className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      )}
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 bg-primary/10 rounded-lg")}>
              <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-900">
                {asset.assetName}
              </h3>
              <p className="text-sm text-gray-500">{asset.model}</p>
            </div>
          </div>
          {getAssetTypeBadge(asset.type)}
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          {asset.isReturned ? (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 w-fit"
            >
              <XCircle className="h-3 w-3" />
              Returned
            </Badge>
          ) : (
            <Badge
              variant="default"
              className="flex items-center gap-1 w-fit bg-green-600"
            >
              <CheckCircle className="h-3 w-3" />
              Active
            </Badge>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Company:</span>
            <span className="font-medium text-gray-900">{asset.company}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Serial:</span>
            <span className="font-mono text-xs text-gray-900">
              {asset.serialNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Asset Tag:</span>
            <span className="font-medium text-gray-900">{asset.assetTag}</span>
          </div>

          {/* Specs */}
          {asset.cpu && (
            <div className="flex items-center gap-2 text-sm">
              <Cpu className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">CPU:</span>
              <span className="text-gray-900">{asset.cpu}</span>
            </div>
          )}

          {asset.ram && (
            <div className="flex items-center gap-2 text-sm">
              <Save className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">RAM:</span>
              <span className="text-gray-900">{asset.ram}</span>
            </div>
          )}

          {asset.storage && (
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Storage:</span>
              <span className="text-gray-900">{asset.storage}</span>
            </div>
          )}

          {asset.screenSize && (
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Screen:</span>
              <span className="text-gray-900">{asset.screenSize}</span>
            </div>
          )}

          {asset.macAddress && (
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">MAC:</span>
              <span className="font-mono text-xs text-gray-900">
                {asset.macAddress}
              </span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>Assigned: {formatDate(asset.assignedDate)}</span>
          </div>
          {asset.returnedDate && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>Returned: {formatDate(asset.returnedDate)}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {(asset.notes || asset.returnNotes) && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            {asset.notes && (
              <p className="text-xs text-gray-600">
                <span className="font-medium">Notes:</span> {asset.notes}
              </p>
            )}
            {asset.returnNotes && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium">Return Notes:</span>{" "}
                {asset.returnNotes}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {canEdit && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            {!asset.isReturned && (
              <>
                <Button
                  onClick={onReturn}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  return
                </Button>
              </>
            )}
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className={cn(!asset.isReturned && "flex-1")}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component
export default function AssetsInfo({
  userId,
  canEdit = true,
  onAssetUpdated,
}: AssetsInfoProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const targetUserId = userId || currentUser?.id;

  const {
    data: assets,
    isLoading,
    error,
    isError,
    refetch,
  } = useGetUserAssetsQuery(targetUserId!, {
    skip: !targetUserId,
  });

  const [deleteAsset] = useDeleteAssetMutation();
  const [returnAsset] = useReturnAssetMutation();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Check if user can edit assets
  const canEditAssets = currentUser
    ? ALLOWED_EDIT_ROLES.includes(currentUser.systemRole || "")
    : false;

  // Handle edit asset
  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsEditDialogOpen(true);
  };

  // Handle delete asset
  const handleDeleteAsset = async (assetId: number) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    try {
      await deleteAsset(assetId).unwrap();
      toast.success("Asset deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error("Failed to delete asset", {
        description: error?.data?.message || "Please try again later",
      });
    }
  };

  // Handle return asset
  const handleReturnAsset = async (assetId: number) => {
    const returnNotes = window.prompt("Enter return notes (optional):");
    if (returnNotes === null) return; // User cancelled

    try {
      await returnAsset({
        assetId,
        data: { returnNotes: returnNotes || "" },
      }).unwrap();
      toast.success("Asset returned successfully");
      refetch();
    } catch (error: any) {
      toast.error("Failed to return asset", {
        description: error?.data?.message || "Please try again later",
      });
    }
  };

  // Loading state
  if (isLoading) return <LoadingState />;

  // Error state
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  // No assets state
  if (!assets || assets.length === 0) {
    return <NoAssetsState userId={targetUserId!} />;
  }

  // Separate active and returned assets
  const activeAssets = assets.filter((asset) => !asset.isReturned);
  const returnedAssets = assets.filter((asset) => asset.isReturned);

  // Calculate statistics
  const totalAssets = assets.length;
  const activeCount = activeAssets.length;
  const returnedCount = returnedAssets.length;

  return (
    <>
      <div className="space-y-6">
        {/* Header Section with Edit button in top right */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assets</h2>
            <p className="text-gray-600 mt-1">Assigned devices and equipment</p>
          </div>
          {canEdit && canEditAssets && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Trigger the edit dialog or modal
                  setIsEditDialogOpen(true);
                }}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Assign Asset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Alert className="border-l-4 border-[#6039BB] bg-purple-50">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Assets</span>
                <Badge className="bg-purple-600 ml-2">{totalAssets}</Badge>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-l-4 border-green-500 bg-green-50">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium">Active</span>
                <Badge className="bg-green-600 ml-2">{activeCount}</Badge>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-l-4 border-gray-500 bg-gray-50">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="font-medium">Returned</span>
                <Badge variant="secondary" className="ml-2">
                  {returnedCount}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Active Assets */}
        {activeAssets.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Assets ({activeCount})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  canEdit={canEdit && canEditAssets}
                  onEdit={() => handleEditAsset(asset)}
                  onDelete={() => handleDeleteAsset(asset.id)}
                  onReturn={() => handleReturnAsset(asset.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Returned Assets */}
        {returnedAssets.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Returned Assets ({returnedCount})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {returnedAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  canEdit={canEdit && canEditAssets}
                  onDelete={() => handleDeleteAsset(asset.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer - removed Edit button */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <div>
            Last updated:{" "}
            {assets.length > 0 ? formatDate(assets[0]?.updatedAt) : "No assets"}
          </div>
          <div>
            Viewing {totalAssets} {totalAssets === 1 ? "asset" : "assets"}
          </div>
        </div>
      </div>

      {/* Edit Asset Dialog */}
      <EditAssetDialog
        asset={selectedAsset}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateSuccess={async () => {
          refetch();
          toast.success("Asset updated successfully");
        }}
      />
    </>
  );
}
