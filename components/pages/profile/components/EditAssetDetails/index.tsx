"use client";

import { useState, useEffect } from "react";
import { useUpdateAssetMutation } from "@/redux/services/assetApi";
import { useAppSelector } from "@/redux/hook";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Laptop,
  Building,
  Hash,
  Package,
  Cpu,
  HardDrive,
  Monitor,
  Wifi,
  Save,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Asset, AssetType } from "@/redux/types/asset.type";
import { toast } from "sonner";

// Constants
const ALLOWED_EDIT_ROLES = ["ADMIN", "HRM", "OPERATION_MANAGER"];

// Asset Type Options
const ASSET_TYPE_OPTIONS = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "DESKTOP", label: "Desktop" },
  { value: "MONITOR", label: "Monitor" },
  { value: "PHONE", label: "Phone" },
  { value: "TABLET", label: "Tablet" },
  { value: "ACCESSORY", label: "Accessory" },
  { value: "OTHER", label: "Other" },
] as const;

// Types
interface EditAssetDialogProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess?: (updatedAsset: Asset) => Promise<void>;
  isLoading?: boolean;
}

interface FormField {
  id: keyof Asset;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "select";
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  section?: string;
  span?: number;
}

// Form Configuration
const FORM_FIELDS: FormField[] = [
  // Basic Information (Required)
  {
    id: "type",
    label: "Asset Type *",
    placeholder: "Select asset type",
    type: "select",
    required: true,
    icon: Laptop,
    span: 1,
  },
  {
    id: "assetName",
    label: "Asset Name *",
    placeholder: "e.g., Dell Latitude 5420",
    required: true,
    icon: Package,
    span: 1,
  },
  {
    id: "company",
    label: "Company/Brand *",
    placeholder: "e.g., Dell, HP, Apple",
    required: true,
    icon: Building,
    span: 1,
  },
  {
    id: "model",
    label: "Model *",
    placeholder: "e.g., Latitude 5420, MacBook Pro M1",
    required: true,
    icon: FileText,
    span: 1,
  },
  {
    id: "serialNumber",
    label: "Serial Number *",
    placeholder: "e.g., SN123456789",
    required: true,
    icon: Hash,
    span: 1,
  },
  {
    id: "assetTag",
    label: "Asset Tag *",
    placeholder: "e.g., ASSET-001",
    required: true,
    icon: Hash,
    span: 1,
  },

  // Specifications (Optional)
  {
    id: "cpu",
    label: "CPU/Processor",
    placeholder: "e.g., Intel Core i7-11th Gen",
    icon: Cpu,
    span: 1,
  },
  {
    id: "ram",
    label: "RAM",
    placeholder: "e.g., 16GB DDR4",
    icon: Save,
    span: 1,
  },
  {
    id: "storage",
    label: "Storage",
    placeholder: "e.g., 512GB SSD",
    icon: HardDrive,
    span: 1,
  },
  {
    id: "gpu",
    label: "GPU/Graphics",
    placeholder: "e.g., NVIDIA GeForce GTX 1650",
    icon: Monitor,
    span: 1,
  },
  {
    id: "screenSize",
    label: "Screen Size",
    placeholder: "e.g., 15.6 inches",
    icon: Monitor,
    span: 1,
  },
  {
    id: "macAddress",
    label: "MAC Address",
    placeholder: "e.g., 00:1B:44:11:3A:B7",
    icon: Wifi,
    span: 1,
  },
];

// Helper Components
const FormInputWithIcon: React.FC<{
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}> = ({ icon: Icon, children }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
    )}
    {children}
  </div>
);

const SectionHeader: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}> = ({ icon: Icon, title }) => (
  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
    <Icon className="h-5 w-5 text-[rgb(96,57,187)]" />
    {title}
  </h3>
);

const DialogHeaderSection: React.FC<{
  asset: Asset;
  currentUser: any;
}> = ({ asset, currentUser }) => (
  <div className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] text-white p-8 rounded-t-2xl">
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold text-white">
        Edit Asset Information
      </DialogTitle>
      <DialogDescription className="text-white/90 text-lg">
        Updating asset: {asset.assetName}
        {currentUser?.systemRole && ` (You are ${currentUser.systemRole})`}
      </DialogDescription>
    </DialogHeader>
  </div>
);

// Main Component
export function EditAssetDialog({
  asset,
  open,
  onOpenChange,
  onUpdateSuccess,
  isLoading: externalLoading,
}: EditAssetDialogProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateAsset, { isLoading: isUpdating }] = useUpdateAssetMutation();
  const [editData, setEditData] = useState<Partial<Asset>>({});
  const [error, setError] = useState<string>("");

  // Check if user can edit asset
  const canEdit = currentUser
    ? ALLOWED_EDIT_ROLES.includes(currentUser.systemRole || "")
    : false;

  // Update editData when asset changes
  useEffect(() => {
    if (asset) {
      const initialData: Partial<Asset> = {};

      FORM_FIELDS.forEach((field) => {
        if (asset[field.id] !== undefined) {
          initialData[field.id] = asset[field.id] as any;
        }
      });

      // Add notes if available
      if (asset.notes !== undefined) {
        initialData.notes = asset.notes;
      }

      setEditData(initialData);
    }
  }, [asset]);

  // Reset error when dialog opens/closes
  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (fieldId: keyof Asset, value: string) => {
    setEditData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const validateForm = (): string | null => {
    if (!asset?.id) return "Asset ID is required";
    if (!canEdit) return "You do not have permission to edit assets";

    // Validate required fields
    const requiredFields = FORM_FIELDS.filter((field) => field.required);
    for (const field of requiredFields) {
      if (!editData[field.id]) {
        return `${field.label.replace(" *", "")} is required`;
      }
    }

    // Validate serial number format (basic check)
    if (editData.serialNumber && editData.serialNumber.length < 3) {
      return "Serial number must be at least 3 characters";
    }

    // Validate asset tag format (basic check)
    if (editData.assetTag && editData.assetTag.length < 3) {
      return "Asset tag must be at least 3 characters";
    }

    return null;
  };

  const handleSaveAsset = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const result = await updateAsset({
        assetId: asset!.id,
        data: editData,
      }).unwrap();

      toast.success("Asset updated successfully");
      if (onUpdateSuccess) await onUpdateSuccess(result);
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      setError(errorMessage || "Failed to update asset");
      toast.error("Failed to update asset", {
        description: errorMessage || "Please try again later",
      });
    }
  };

  if (!asset) return null;

  const renderField = (field: FormField) => {
    const isSelectField = field.type === "select";
    const value = editData[field.id] || "";

    if (isSelectField && field.id === "type") {
      return (
        <Select
          value={value as string}
          onValueChange={(value) => handleSelectChange(field.id, value)}
          disabled={!canEdit}
        >
          <SelectTrigger className="w-full py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)]">
            <FormInputWithIcon icon={field.icon}>
              <SelectValue placeholder={field.placeholder} />
            </FormInputWithIcon>
          </SelectTrigger>
          <SelectContent>
            {ASSET_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "textarea") {
      return (
        <FormInputWithIcon icon={field.icon}>
          <Textarea
            id={field.id}
            name={field.id}
            value={value as string}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            disabled={!canEdit}
            className="pl-10 py-3 min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
          />
        </FormInputWithIcon>
      );
    }

    return (
      <FormInputWithIcon icon={field.icon}>
        <Input
          id={field.id}
          name={field.id}
          type="text"
          value={value as string}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          disabled={!canEdit}
          className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
        />
      </FormInputWithIcon>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        width="5xl"
        className="max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl scrollbar-hide"
      >
        <DialogHeaderSection asset={asset} currentUser={currentUser} />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mx-8 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Permission Warning */}
        {!canEdit && (
          <Alert variant="destructive" className="mx-8 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to edit assets. Only ADMIN, HRM, and
              Operation Managers can edit assets.
            </AlertDescription>
          </Alert>
        )}

        {/* Content Area */}
        <div className="p-8 space-y-8 bg-white">
          {/* Basic Information */}
          <SectionHeader icon={Laptop} title="Basic Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FORM_FIELDS.slice(0, 6).map((field) => (
              <div key={field.id} className="space-y-3">
                <Label
                  htmlFor={field.id}
                  className="text-sm font-medium text-gray-700"
                >
                  {field.label}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <Separator />

          {/* Specifications */}
          <SectionHeader icon={Cpu} title="Technical Specifications" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FORM_FIELDS.slice(6, 12).map((field) => (
              <div key={field.id} className="space-y-3">
                <Label
                  htmlFor={field.id}
                  className="text-sm font-medium text-gray-700"
                >
                  {field.label}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <Separator />

          {/* Additional Notes */}
          <SectionHeader icon={FileText} title="Additional Information" />
          <div className="space-y-3">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Notes (Optional)
            </Label>
            <FormInputWithIcon icon={FileText}>
              <Textarea
                id="notes"
                name="notes"
                value={(editData.notes as string) || ""}
                onChange={handleInputChange}
                placeholder="Add any additional notes about this asset..."
                disabled={!canEdit}
                className="pl-10 py-3 min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
              />
            </FormInputWithIcon>
          </div>

          {/* Asset Status Info */}
          {asset.isReturned && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This asset has been returned and is no longer in active use.
                {asset.returnedDate && (
                  <span className="block mt-1">
                    Returned on:{" "}
                    {new Date(asset.returnedDate).toLocaleDateString()}
                  </span>
                )}
                {asset.returnNotes && (
                  <span className="block mt-1">
                    Return notes: {asset.returnNotes}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="p-6 bg-gray-50 rounded-b-2xl border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl px-8 py-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAsset}
            disabled={isUpdating || externalLoading || !canEdit}
            className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] hover:from-[rgb(86,47,177)] hover:to-[rgb(110,70,190)] rounded-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating || externalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Asset...
              </>
            ) : (
              "Update Asset"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
