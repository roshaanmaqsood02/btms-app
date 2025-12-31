"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Package,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Hash,
  Building,
  Save,
  Loader2,
} from "lucide-react";
import { AssetType, CreateAssetRequest } from "@/redux/types/asset.type";
import { toast } from "sonner";

interface CreateAssetInfoProps {
  userId: number | string;
  onAssetCreated?: () => void;
  onAssetAdded?: (asset: CreateAssetRequest) => void;
  currentUserRole?: string;
}

export default function CreateAssetInfo({
  userId,
  onAssetCreated,
  onAssetAdded,
  currentUserRole = "EMPLOYEE",
}: CreateAssetInfoProps) {
  const [formData, setFormData] = useState<CreateAssetRequest>({
    type: "LAPTOP",
    assetName: "",
    company: "",
    model: "",
    serialNumber: "",
    assetTag: "",
    screenSize: "not_specified",
    cpu: "",
    gpu: "",
    ram: "not_specified",
    macAddress: "",
    storage: "not_specified",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Asset Type Options
  const ASSET_TYPE_OPTIONS: { value: AssetType; label: string; icon: any }[] = [
    { value: "LAPTOP", label: "Laptop", icon: Laptop },
    { value: "DESKTOP", label: "Desktop", icon: Monitor },
    { value: "MONITOR", label: "Monitor", icon: Monitor },
    { value: "PHONE", label: "Phone", icon: Smartphone },
    { value: "TABLET", label: "Tablet", icon: Tablet },
    { value: "ACCESSORY", label: "Accessory", icon: Package },
    { value: "OTHER", label: "Other", icon: Package },
  ];

  // Screen Size Options
  const SCREEN_SIZE_OPTIONS = [
    "13 Inch",
    "14 Inch",
    "15.6 Inch",
    "16 Inch",
    "17 Inch",
    "21.5 Inch",
    "24 Inch",
    "27 Inch",
    "32 Inch",
    "Other",
  ];

  // RAM Options
  const RAM_OPTIONS = [
    "4 GB",
    "8 GB",
    "16 GB",
    "32 GB",
    "64 GB",
    "128 GB",
    "Other",
  ];

  // Storage Options
  const STORAGE_OPTIONS = [
    "128 GB",
    "256 GB",
    "512 GB",
    "1 TB",
    "2 TB",
    "4 TB",
    "Other",
  ];

  // Company Options
  const COMPANY_OPTIONS = [
    "DELL",
    "HP",
    "Lenovo",
    "Apple",
    "ASUS",
    "Acer",
    "Microsoft",
    "Samsung",
    "LG",
    "Other",
  ];

  const handleChange = useCallback(
    (field: keyof CreateAssetRequest, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.type.trim()) newErrors.type = "Asset type is required";
    if (!formData.assetName.trim())
      newErrors.assetName = "Asset name is required";
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.serialNumber.trim())
      newErrors.serialNumber = "Serial number is required";
    if (!formData.assetTag.trim()) newErrors.assetTag = "Asset tag is required";

    // Serial number format validation (basic)
    if (formData.serialNumber && formData.serialNumber.length < 3) {
      newErrors.serialNumber = "Serial number is too short";
    }

    // MAC Address format validation (if provided)
    if (
      formData.macAddress &&
      !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.macAddress)
    ) {
      newErrors.macAddress =
        "Invalid MAC address format (use 00:1A:2B:3C:4D:5E)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare asset data
      const assetData: CreateAssetRequest = {
        type: formData.type,
        assetName: formData.assetName,
        company: formData.company,
        model: formData.model,
        serialNumber: formData.serialNumber,
        assetTag: formData.assetTag,
        ...(formData.screenSize !== "not_specified" && {
          screenSize: formData.screenSize,
        }),
        ...(formData.cpu && { cpu: formData.cpu }),
        ...(formData.gpu && { gpu: formData.gpu }),
        ...(formData.ram !== "not_specified" && { ram: formData.ram }),
        ...(formData.macAddress && { macAddress: formData.macAddress }),
        ...(formData.storage !== "not_specified" && {
          storage: formData.storage,
        }),
        ...(formData.notes && { notes: formData.notes }),
      };

      // For form state (userId is 0 for new users)
      if (onAssetAdded) {
        onAssetAdded(assetData);
        toast.success("Asset added to form!");
      }

      // Reset form
      setFormData({
        type: "LAPTOP",
        assetName: "",
        company: "",
        model: "",
        serialNumber: "",
        assetTag: "",
        screenSize: "not_specified",
        cpu: "",
        gpu: "",
        ram: "not_specified",
        macAddress: "",
        storage: "not_specified",
        notes: "",
      });

      if (onAssetCreated) {
        onAssetCreated();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to add asset";
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    },
    [handleSubmit]
  );

  const handleClearForm = () => {
    setFormData({
      type: "LAPTOP",
      assetName: "",
      company: "",
      model: "",
      serialNumber: "",
      assetTag: "",
      screenSize: "not_specified",
      cpu: "",
      gpu: "",
      ram: "not_specified",
      macAddress: "",
      storage: "not_specified",
      notes: "",
    });
    setErrors({});
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Assign New Asset
        </h2>
        <p className="text-gray-600">
          Assign a new hardware asset to the employee
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset Basic Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Laptop className="h-5 w-5 text-[rgb(96,57,187)]" />
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-1">
                Asset Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleChange("type", value as AssetType)
                }
              >
                <SelectTrigger
                  className={`w-full ${errors.type ? "border-red-500" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select asset type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="assetName" className="flex items-center gap-1">
                Asset Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="assetName"
                  value={formData.assetName}
                  onChange={(e) => handleChange("assetName", e.target.value)}
                  placeholder="e.g., DELL Latitude 5400, MacBook Pro M2"
                  className={`pl-10 ${
                    errors.assetName ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.assetName && (
                <p className="text-sm text-red-500">{errors.assetName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Company & Model */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building className="h-5 w-5 text-[rgb(96,57,187)]" />
            Manufacturer Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-1">
                Company <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.company}
                onValueChange={(value) => handleChange("company", value)}
              >
                <SelectTrigger
                  className={`w-full ${errors.company ? "border-red-500" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select company" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_OPTIONS.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company}</p>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model" className="flex items-center gap-1">
                Model <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <HardDrive className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="e.g., Latitude 5400, iPhone 15 Pro"
                  className={`pl-10 ${errors.model ? "border-red-500" : ""}`}
                />
              </div>
              {errors.model && (
                <p className="text-sm text-red-500">{errors.model}</p>
              )}
            </div>
          </div>
        </div>

        {/* Identification */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Hash className="h-5 w-5 text-[rgb(96,57,187)]" />
            Identification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Serial Number */}
            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="flex items-center gap-1">
                Serial Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange("serialNumber", e.target.value)}
                  placeholder="e.g., BKTS-OL122, C02XV0ABCDEF"
                  className={`pl-10 ${
                    errors.serialNumber ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.serialNumber && (
                <p className="text-sm text-red-500">{errors.serialNumber}</p>
              )}
            </div>

            {/* Asset Tag */}
            <div className="space-y-2">
              <Label htmlFor="assetTag" className="flex items-center gap-1">
                Asset Tag <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="assetTag"
                  value={formData.assetTag}
                  onChange={(e) => handleChange("assetTag", e.target.value)}
                  placeholder="e.g., ASSET-001, IT-2024-001"
                  className={`pl-10 ${errors.assetTag ? "border-red-500" : ""}`}
                />
              </div>
              {errors.assetTag && (
                <p className="text-sm text-red-500">{errors.assetTag}</p>
              )}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[rgb(96,57,187)]" />
            Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Screen Size */}
            <div className="space-y-2">
              <Label htmlFor="screenSize">
                Screen Size{" "}
                <span className="text-sm text-gray-500">(Optional)</span>
              </Label>
              <Select
                value={formData.screenSize}
                onValueChange={(value) => handleChange("screenSize", value)}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select screen size" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Not specified</SelectItem>
                  {SCREEN_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RAM */}
            <div className="space-y-2">
              <Label htmlFor="ram">
                RAM <span className="text-sm text-gray-500">(Optional)</span>
              </Label>
              <Select
                value={formData.ram}
                onValueChange={(value) => handleChange("ram", value)}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select RAM" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Not specified</SelectItem>
                  {RAM_OPTIONS.map((ram) => (
                    <SelectItem key={ram} value={ram}>
                      {ram}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <Label htmlFor="storage">
                Storage{" "}
                <span className="text-sm text-gray-500">(Optional)</span>
              </Label>
              <Select
                value={formData.storage}
                onValueChange={(value) => handleChange("storage", value)}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select storage" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Not specified</SelectItem>
                  {STORAGE_OPTIONS.map((storage) => (
                    <SelectItem key={storage} value={storage}>
                      {storage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CPU */}
            <div className="space-y-2">
              <Label htmlFor="cpu">
                CPU <span className="text-sm text-gray-500">(Optional)</span>
              </Label>
              <div className="relative">
                <Cpu className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="cpu"
                  value={formData.cpu}
                  onChange={(e) => handleChange("cpu", e.target.value)}
                  placeholder="e.g., Intel Core i5 8365, Apple M2 Pro"
                  className="pl-10"
                />
              </div>
            </div>

            {/* GPU */}
            <div className="space-y-2">
              <Label htmlFor="gpu">
                GPU <span className="text-sm text-gray-500">(Optional)</span>
              </Label>
              <div className="relative">
                <Cpu className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="gpu"
                  value={formData.gpu}
                  onChange={(e) => handleChange("gpu", e.target.value)}
                  placeholder="e.g., NVIDIA RTX 4060, Integrated"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* MAC Address */}
          <div className="space-y-2">
            <Label htmlFor="macAddress">
              MAC Address{" "}
              <span className="text-sm text-gray-500">(Optional)</span>
            </Label>
            <div className="relative">
              <Wifi className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="macAddress"
                value={formData.macAddress}
                onChange={(e) => handleChange("macAddress", e.target.value)}
                placeholder="e.g., 00:1A:2B:3C:4D:5E"
                className={`pl-10 ${errors.macAddress ? "border-red-500" : ""}`}
              />
            </div>
            {errors.macAddress && (
              <p className="text-sm text-red-500">{errors.macAddress}</p>
            )}
            <p className="text-xs text-gray-500">
              Format: 00:1A:2B:3C:4D:5E or 00-1A-2B-3C-4D-5E
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Save className="h-5 w-5 text-[rgb(96,57,187)]" />
            Additional Information
          </h3>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-sm text-gray-500">(Optional)</span>
            </Label>
            <div className="relative">
              <Save className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="e.g., Assigned to new employee, Includes docking station, Warranty until 2025"
                className="pl-10 min-h-[100px] resize-none"
                onKeyPress={handleKeyPress}
              />
            </div>
            <p className="text-sm text-gray-500">
              Add any additional information about the asset, such as
              accessories, warranty, or special instructions.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearForm}
              disabled={isSubmitting}
              className="rounded-xl px-8"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] hover:from-[rgb(86,47,177)] hover:to-[rgb(110,70,190)] text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Asset"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
