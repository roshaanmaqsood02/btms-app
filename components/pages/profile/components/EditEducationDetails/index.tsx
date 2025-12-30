"use client";

import { useState, useEffect, useMemo } from "react";
import { useUpdateEducationMutation } from "@/redux/services/educationApi";
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
  GraduationCap,
  BookOpen,
  School,
  Award,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Education,
  UpdateEducationRequest,
} from "@/redux/types/education.type";

// Constants
const ALLOWED_EDIT_ROLES = ["ADMIN", "HRM", "OPERATION_MANAGER", "EMPLOYEE"];

// Degree Options
const DEGREE_OPTIONS = [
  { value: "High School", label: "High School" },
  { value: "Associate Degree", label: "Associate Degree" },
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: "Doctorate", label: "Doctorate" },
  { value: "Diploma", label: "Diploma" },
  { value: "Certificate", label: "Certificate" },
  { value: "Other", label: "Other" },
] as const;

// Grade Scale Options
const GRADE_SCALE_OPTIONS = [
  { value: "4.0 Scale", label: "4.0 Scale" },
  { value: "5.0 Scale", label: "5.0 Scale" },
  { value: "Percentage", label: "Percentage" },
  { value: "GPA", label: "GPA" },
  { value: "CGPA", label: "CGPA" },
  { value: "Letter Grade", label: "Letter Grade" },
  { value: "Other", label: "Other" },
] as const;

// Types
interface EditEducationDialogProps {
  education: Education | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess?: (updatedEducation: Education) => Promise<void>;
  isLoading?: boolean;
}

interface FormField {
  id: keyof UpdateEducationRequest;
  label: string;
  placeholder: string;
  type?: "text" | "number" | "textarea";
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  span?: number;
}

// Form Configuration
const FORM_FIELDS: FormField[] = [
  // Degree Information
  {
    id: "degree",
    label: "Degree *",
    placeholder: "Select degree level",
    required: true,
    icon: GraduationCap,
    span: 1,
  },
  {
    id: "fieldOfStudy",
    label: "Field of Study *",
    placeholder: "e.g., Computer Science, Business Administration",
    required: true,
    icon: BookOpen,
    span: 2,
  },

  // Institution
  {
    id: "institution",
    label: "Institution *",
    placeholder: "e.g., University of Example, College Name",
    required: true,
    icon: School,
    span: 2,
  },

  // Years
  {
    id: "startYear",
    label: "Start Year *",
    placeholder: "e.g., 2018",
    type: "number",
    required: true,
    icon: Calendar,
    span: 1,
  },
  {
    id: "endYear",
    label: "End Year (Optional)",
    placeholder: "e.g., 2022",
    type: "number",
    icon: Calendar,
    span: 1,
  },

  // Grade Information
  {
    id: "grade",
    label: "Grade (Optional)",
    placeholder: "e.g., 3.8, 85%, A+",
    icon: Award,
    span: 1,
  },
  {
    id: "gradeScale",
    label: "Grade Scale (Optional)",
    placeholder: "Select grade scale",
    icon: Award,
    span: 1,
  },

  // Description
  {
    id: "description",
    label: "Description (Optional)",
    placeholder: "Additional information about your education...",
    type: "textarea",
    icon: FileText,
    span: 3,
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
  education: Education;
  currentUser: any;
}> = ({ education, currentUser }) => (
  <div className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] text-white p-8 rounded-t-2xl">
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold text-white">
        Edit Education Information
      </DialogTitle>
      <DialogDescription className="text-white/90 text-lg">
        Updating education record: {education.degree} at {education.institution}
        {currentUser?.systemRole && ` (You are ${currentUser.systemRole})`}
      </DialogDescription>
    </DialogHeader>
  </div>
);

// Main Component
export function EditEducationDialog({
  education,
  open,
  onOpenChange,
  onUpdateSuccess,
  isLoading: externalLoading,
}: EditEducationDialogProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateEducation, { isLoading: isUpdating }] =
    useUpdateEducationMutation();
  const [editData, setEditData] = useState<UpdateEducationRequest>({});
  const [error, setError] = useState<string>("");

  // Check if user can edit education
  const canEdit = currentUser
    ? ALLOWED_EDIT_ROLES.includes(currentUser.systemRole || "")
    : false;

  // Check if user can edit this specific education record
  const canEditThisEducation = useMemo(() => {
    if (!currentUser || !education) return false;

    // Users can edit their own education
    if (currentUser.id === education.userId) return true;

    // ADMIN, HRM, OPERATION_MANAGER can edit any education
    return (
      currentUser.systemRole === "ADMIN" ||
      currentUser.systemRole === "HRM" ||
      currentUser.systemRole === "OPERATION_MANAGER"
    );
  }, [currentUser, education]);

  // Update editData when education changes
  useEffect(() => {
    if (education) {
      const initialData: UpdateEducationRequest = {};

      FORM_FIELDS.forEach((field) => {
        const value = education[field.id as keyof Education];
        if (value !== undefined && value !== null) {
          initialData[field.id] = value as any;
        }
      });

      setEditData(initialData);
    }
  }, [education]);

  // Reset error when dialog opens/closes
  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: any = value;

    if (type === "number") {
      const numValue = value === "" ? undefined : parseInt(value, 10);
      if (numValue !== undefined && !isNaN(numValue)) {
        processedValue = numValue;
      } else {
        processedValue = undefined;
      }
    }

    setEditData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSelectChange = (
    fieldId: keyof UpdateEducationRequest,
    value: string
  ) => {
    const processedValue = value === "" ? undefined : value;
    setEditData((prev) => ({ ...prev, [fieldId]: processedValue }));
  };

  const validateForm = (): string | null => {
    if (!education?.id) return "Education ID is required";
    if (!canEditThisEducation)
      return "You do not have permission to edit this education record";

    // Validate required fields
    const requiredFields = FORM_FIELDS.filter((field) => field.required);
    for (const field of requiredFields) {
      if (!editData[field.id]) {
        return `${field.label.replace(" *", "")} is required`;
      }
    }

    // Validate years
    if (editData.startYear) {
      const currentYear = new Date().getFullYear();

      if (editData.startYear < 1900 || editData.startYear > currentYear) {
        return `Start year must be between 1900 and ${currentYear}`;
      }

      if (editData.endYear) {
        if (editData.endYear < 1900 || editData.endYear > currentYear + 10) {
          return `End year must be between 1900 and ${currentYear + 10}`;
        }

        if (editData.endYear < editData.startYear) {
          return "End year must be greater than or equal to start year";
        }
      }
    }

    return null;
  };

  const handleSaveEducation = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const result = await updateEducation({
        educationId: education!.id,
        data: editData,
      }).unwrap();

      if (onUpdateSuccess) await onUpdateSuccess(result);
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      setError(errorMessage || "Failed to update education record");
    }
  };

  if (!education) return null;

  const getSelectOptions = (fieldId: keyof UpdateEducationRequest) => {
    switch (fieldId) {
      case "degree":
        return DEGREE_OPTIONS;
      case "gradeScale":
        return GRADE_SCALE_OPTIONS;
      default:
        return [];
    }
  };

  const renderField = (field: FormField) => {
    const isSelectField = ["degree", "gradeScale"].includes(field.id);
    const value = editData[field.id] || "";

    if (isSelectField) {
      const options = getSelectOptions(field.id);

      return (
        <Select
          value={value as string}
          onValueChange={(value) => handleSelectChange(field.id, value)}
          disabled={!canEditThisEducation}
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
            disabled={!canEditThisEducation}
            className="pl-10 py-3 min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
          />
        </FormInputWithIcon>
      );
    }

    const inputValue = value.toString();

    return (
      <FormInputWithIcon icon={field.icon}>
        <Input
          id={field.id}
          name={field.id}
          type={field.type || "text"}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          disabled={!canEditThisEducation}
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
        <DialogHeaderSection education={education} currentUser={currentUser} />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mx-8 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Permission Warning */}
        {!canEditThisEducation && (
          <Alert variant="destructive" className="mx-8 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to edit this education record. You can
              only edit your own education records.
            </AlertDescription>
          </Alert>
        )}

        {/* Content Area */}
        <div className="p-8 space-y-8 bg-white">
          {/* Degree Information */}
          <SectionHeader icon={GraduationCap} title="Degree Information" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FORM_FIELDS.slice(0, 2).map((field) => (
              <div
                key={field.id}
                className={`space-y-3 ${
                  field.span === 2 ? "md:col-span-2" : ""
                }`}
              >
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

          {/* Institution */}
          <SectionHeader icon={School} title="Institution Details" />
          <div className="grid grid-cols-1 gap-6">
            {FORM_FIELDS.slice(2, 3).map((field) => (
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

          {/* Years of Study */}
          <SectionHeader icon={Calendar} title="Duration of Study" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FORM_FIELDS.slice(3, 5).map((field) => (
              <div key={field.id} className="space-y-3">
                <Label
                  htmlFor={field.id}
                  className="text-sm font-medium text-gray-700"
                >
                  {field.label}
                </Label>
                {renderField(field)}
                {field.id === "endYear" && !editData.endYear && (
                  <p className="text-sm text-gray-500">
                    Leave empty if this is an ongoing education
                  </p>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Grade Information */}
          <SectionHeader icon={Award} title="Academic Performance" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FORM_FIELDS.slice(5, 7).map((field) => (
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

          {/* Description */}
          <SectionHeader icon={FileText} title="Additional Information" />
          <div className="grid grid-cols-1 gap-6">
            {FORM_FIELDS.slice(7, 8).map((field) => (
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

          {/* Quick Tips */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <ul className="list-disc pl-4 space-y-1">
                <li>Leave "End Year" empty if this is an ongoing education</li>
                <li>Include your grade and scale (e.g., 3.8/4.0, 85%, A+)</li>
                <li>
                  Add relevant details like honors, thesis topics, or special
                  achievements in the description
                </li>
              </ul>
            </AlertDescription>
          </Alert>
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
            onClick={handleSaveEducation}
            disabled={isUpdating || externalLoading || !canEditThisEducation}
            className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] hover:from-[rgb(86,47,177)] hover:to-[rgb(110,70,190)] rounded-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating || externalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Education...
              </>
            ) : (
              "Update Education"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
