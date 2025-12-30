"use client";

import { useState, useEffect } from "react";
import { useUpdateContractMutation } from "@/redux/services/contractApi";
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
  Briefcase,
  Building,
  Users,
  Calendar,
  Clock,
  MapPin,
  User,
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
import { EmployeeContract } from "@/redux/types/contract.type";

// Constants
const ALLOWED_EDIT_ROLES = ["ADMIN", "HRM", "OPERATION_MANAGER"];

// Status Options
const STATUS_OPTIONS = [
  { value: "EMPLOYEED", label: "Employeed" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "RESIGNED", label: "Resigned" },
  { value: "CONTRACT_TERMINATED", label: "Terminated" },
] as const;

// Job Type Options
const JOB_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
] as const;

// Shift Options
const SHIFT_OPTIONS = [
  { value: "MORNING", label: "Morning" },
  { value: "EVENING", label: "Evening" },
  { value: "NIGHT", label: "Night" },
  { value: "FLEXIBLE", label: "Flexible" },
] as const;

// Work Location Options
const WORK_LOCATION_OPTIONS = [
  { value: "ON_SITE", label: "On Site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
] as const;

// Types
interface EditContractDialogProps {
  contract: EmployeeContract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess?: (updatedContract: EmployeeContract) => Promise<void>;
  isLoading?: boolean;
}

interface FormField {
  id: keyof EmployeeContract;
  label: string;
  placeholder: string;
  type?: "text" | "date" | "textarea";
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  section?: string;
  span?: number;
}

// Form Configuration
const FORM_FIELDS: FormField[] = [
  // Status & Job Type
  {
    id: "employeeStatus",
    label: "Employee Status",
    placeholder: "Select status",
    span: 1,
  },
  {
    id: "jobType",
    label: "Job Type",
    placeholder: "Select job type",
    span: 1,
  },

  // Department, Designation, Position (Required)
  {
    id: "department",
    label: "Department *",
    placeholder: "e.g., Development, HR",
    required: true,
    icon: Building,
    span: 1,
  },
  {
    id: "designation",
    label: "Designation *",
    placeholder: "e.g., Software Engineer, HR Manager",
    required: true,
    icon: User,
    span: 1,
  },
  {
    id: "position",
    label: "Position *",
    placeholder: "e.g., Full Stack Developer, Recruiter",
    required: true,
    icon: Briefcase,
    span: 1,
  },

  // Reporting Structure
  {
    id: "reportingHr",
    label: "Reporting HR",
    placeholder: "HR Manager name",
    icon: Users,
    span: 1,
  },
  {
    id: "reportingManager",
    label: "Reporting Manager",
    placeholder: "Project Manager name",
    icon: Users,
    span: 1,
  },
  {
    id: "reportingTeamLead",
    label: "Reporting Team Lead",
    placeholder: "Team Lead name",
    icon: Users,
    span: 1,
  },

  // Dates
  {
    id: "joiningDate",
    label: "Joining Date",
    placeholder: "Select date",
    type: "date",
    icon: Calendar,
    span: 1,
  },
  {
    id: "contractStart",
    label: "Contract Start Date *",
    placeholder: "Select date",
    type: "date",
    required: true,
    icon: Calendar,
    span: 1,
  },
  {
    id: "contractEnd",
    label: "Contract End Date *",
    placeholder: "Select date",
    type: "date",
    required: true,
    icon: Calendar,
    span: 1,
  },

  // Work Schedule
  {
    id: "shift",
    label: "Shift",
    placeholder: "Select shift",
    span: 1,
  },
  {
    id: "workLocation",
    label: "Work Location",
    placeholder: "Select location",
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
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
  contract: EmployeeContract;
  currentUser: any;
}> = ({ contract, currentUser }) => (
  <div className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] text-white p-8 rounded-t-2xl">
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold text-white">
        Edit Contract Information
      </DialogTitle>
      <DialogDescription className="text-white/90 text-lg">
        Updating contract for: {contract.designation}
        {currentUser?.systemRole && ` (You are ${currentUser.systemRole})`}
      </DialogDescription>
    </DialogHeader>
  </div>
);

// Main Component
export function EditContractDialog({
  contract,
  open,
  onOpenChange,
  onUpdateSuccess,
  isLoading: externalLoading,
}: EditContractDialogProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateContract, { isLoading: isUpdating }] =
    useUpdateContractMutation();
  const [editData, setEditData] = useState<Partial<EmployeeContract>>({});
  const [error, setError] = useState<string>("");

  // Check if user can edit contract
  const canEdit = currentUser
    ? ALLOWED_EDIT_ROLES.includes(currentUser.systemRole || "")
    : false;

  // Update editData when contract changes
  useEffect(() => {
    if (contract) {
      const initialData: Partial<EmployeeContract> = {};

      FORM_FIELDS.forEach((field) => {
        if (contract[field.id] !== undefined) {
          initialData[field.id] = contract[field.id] as any;
        }
      });

      setEditData(initialData);
    }
  }, [contract]);

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

  const handleSelectChange = (
    fieldId: keyof EmployeeContract,
    value: string
  ) => {
    setEditData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const validateForm = (): string | null => {
    if (!contract?.id) return "Contract ID is required";
    if (!canEdit) return "You do not have permission to edit contracts";

    // Validate required fields
    const requiredFields = FORM_FIELDS.filter((field) => field.required);
    for (const field of requiredFields) {
      if (!editData[field.id]) {
        return `${field.label.replace(" *", "")} is required`;
      }
    }

    // Validate dates
    if (editData.contractStart && editData.contractEnd) {
      const startDate = new Date(editData.contractStart as string);
      const endDate = new Date(editData.contractEnd as string);

      if (endDate <= startDate) {
        return "Contract end date must be after start date";
      }
    }

    return null;
  };

  const handleSaveContract = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const result = await updateContract({
        contractId: contract!.id,
        data: editData,
      }).unwrap();

      if (onUpdateSuccess) await onUpdateSuccess(result);
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      setError(errorMessage || "Failed to update contract");
    }
  };

  if (!contract) return null;

  const getSelectOptions = (fieldId: keyof EmployeeContract) => {
    switch (fieldId) {
      case "employeeStatus":
        return STATUS_OPTIONS;
      case "jobType":
        return JOB_TYPE_OPTIONS;
      case "shift":
        return SHIFT_OPTIONS;
      case "workLocation":
        return WORK_LOCATION_OPTIONS;
      default:
        return [];
    }
  };

  const renderField = (field: FormField) => {
    const isSelectField = [
      "employeeStatus",
      "jobType",
      "shift",
      "workLocation",
    ].includes(field.id);
    const value = editData[field.id] || "";

    if (isSelectField) {
      const options = getSelectOptions(field.id);

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
            {options.map((option) => (
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

    const inputValue =
      field.type === "date"
        ? (value as string)?.split("T")[0] || ""
        : (value as string);

    return (
      <FormInputWithIcon icon={field.icon}>
        <Input
          id={field.id}
          name={field.id}
          type={field.type || "text"}
          value={inputValue}
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
        <DialogHeaderSection contract={contract} currentUser={currentUser} />

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
              You do not have permission to edit contracts. Only ADMIN, HRM, and
              Operation Managers can edit contracts.
            </AlertDescription>
          </Alert>
        )}

        {/* Content Area */}
        <div className="p-8 space-y-8 bg-white">
          {/* Contract Status & Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FORM_FIELDS.slice(0, 2).map((field) => (
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

          {/* Department, Designation, Position */}
          <SectionHeader icon={Building} title="Position Details" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FORM_FIELDS.slice(2, 5).map((field) => (
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

          {/* Reporting Structure */}
          <SectionHeader icon={Users} title="Reporting Structure" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FORM_FIELDS.slice(5, 8).map((field) => (
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

          {/* Dates Section */}
          <SectionHeader icon={Calendar} title="Contract Dates" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FORM_FIELDS.slice(8, 11).map((field) => (
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

          {/* Work Schedule */}
          <SectionHeader icon={Clock} title="Work Schedule" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FORM_FIELDS.slice(11, 13).map((field) => (
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

          {/* Contract Notes */}
          <div className="space-y-3">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Additional Notes (Optional)
            </Label>
            <FormInputWithIcon>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes or terms for this contract..."
                disabled={!canEdit}
                className="pl-10 py-3 min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
              />
            </FormInputWithIcon>
          </div>
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
            onClick={handleSaveContract}
            disabled={isUpdating || externalLoading || !canEdit}
            className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] hover:from-[rgb(86,47,177)] hover:to-[rgb(110,70,190)] rounded-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating || externalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Contract...
              </>
            ) : (
              "Update Contract"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
