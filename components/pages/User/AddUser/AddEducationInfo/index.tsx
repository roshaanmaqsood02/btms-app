"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Calendar,
  GraduationCap,
  BookOpen,
  School,
  Award,
  FileText,
} from "lucide-react";
import { useCreateEducationMutation } from "@/redux/services/educationApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Add EducationItem type definition
interface EducationItem {
  id?: number;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startYear: number;
  endYear?: number;
  grade?: string;
  gradeScale?: string;
  description?: string;
}

interface CreateEducationInfoProps {
  userId: number | string;
  onEducationCreated?: () => void;
  onEducationAdded?: (education: EducationItem) => void;
  currentUserRole?: string;
}

export default function CreateEducationInfo({
  userId,
  onEducationCreated,
  onEducationAdded,
  currentUserRole = "EMPLOYEE",
}: CreateEducationInfoProps) {
  const [createEducation, { isLoading: isCreating }] =
    useCreateEducationMutation();

  const [formData, setFormData] = useState({
    degree: "",
    fieldOfStudy: "",
    institution: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    grade: "",
    gradeScale: "",
    description: "",
  });

  const [isOngoing, setIsOngoing] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // Special value for ongoing education
  const ONGOING_VALUE = "ongoing";

  const handleChange = useCallback(
    (field: string, value: string | number) => {
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
    const currentYear = new Date().getFullYear();

    // Required fields validation
    if (!formData.degree.trim()) newErrors.degree = "Degree is required";
    if (!formData.fieldOfStudy.trim())
      newErrors.fieldOfStudy = "Field of study is required";
    if (!formData.institution.trim())
      newErrors.institution = "Institution is required";

    // Start year validation
    if (!formData.startYear) {
      newErrors.startYear = "Start year is required";
    } else if (formData.startYear < 1900 || formData.startYear > currentYear) {
      newErrors.startYear = `Start year must be between 1900 and ${currentYear}`;
    }

    // End year validation (if not ongoing)
    if (!isOngoing) {
      if (!formData.endYear) {
        newErrors.endYear = "End year is required";
      } else if (
        formData.endYear < 1900 ||
        formData.endYear > currentYear + 10
      ) {
        newErrors.endYear = `End year must be between 1900 and ${
          currentYear + 10
        }`;
      } else if (formData.endYear < formData.startYear) {
        newErrors.endYear =
          "End year must be greater than or equal to start year";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In your CreateEducationInfo.tsx, update the handleSubmit function:

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare education data
      const educationData: EducationItem = {
        degree: formData.degree,
        fieldOfStudy: formData.fieldOfStudy,
        institution: formData.institution,
        startYear: formData.startYear,
        endYear: isOngoing ? undefined : formData.endYear,
        ...(formData.grade && { grade: formData.grade }),
        ...(formData.gradeScale && { gradeScale: formData.gradeScale }),
        ...(formData.description && { description: formData.description }),
      };

      // Check if we're creating education for an existing user
      const isExistingUser =
        userId && userId !== 0 && userId !== "0" && userId !== "";

      if (isExistingUser) {
        // Existing user: Call API
        const apiData = {
          startYear: educationData.startYear,
          endYear: educationData.endYear,
          degree: educationData.degree,
          fieldOfStudy: educationData.fieldOfStudy,
          institution: educationData.institution,
          ...(educationData.grade && { grade: educationData.grade }),
          ...(educationData.gradeScale && {
            gradeScale: educationData.gradeScale,
          }),
          ...(educationData.description && {
            description: educationData.description,
          }),
        };

        await createEducation({
          userId: Number(userId),
          data: apiData,
        }).unwrap();

        toast.success("Education record created successfully!");

        // Call onEducationCreated to refresh the profile
        if (onEducationCreated) {
          onEducationCreated();
        }
      } else {
        // New user: Use the callback to add to form state
        if (onEducationAdded) {
          onEducationAdded(educationData);
          toast.success("Education record added to form!");
        } else {
          throw new Error("Cannot add education: User not created yet");
        }
      }

      // Reset form
      setFormData({
        degree: "",
        fieldOfStudy: "",
        institution: "",
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear(),
        grade: "",
        gradeScale: "",
        description: "",
      });
      setIsOngoing(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create education record";
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

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const generateYearOptions = () => {
    const currentYear = getCurrentYear();
    const years = [];
    for (let year = currentYear + 10; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  // Handle end year selection change
  const handleEndYearChange = (value: string) => {
    if (value === ONGOING_VALUE) {
      setIsOngoing(true);
    } else {
      setIsOngoing(false);
      handleChange("endYear", parseInt(value));
    }
  };

  // Get the display value for end year select
  const getEndYearValue = () => {
    if (isOngoing) {
      return ONGOING_VALUE;
    }
    return formData.endYear.toString();
  };

  return (
    <div className="bg-white p-10 rounded-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Add Education Record
        </h2>
        <p className="text-gray-600">
          Add a new education qualification to your profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Degree Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[rgb(96,57,187)]" />
            Degree Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Degree */}
            <div className="space-y-2">
              <Label htmlFor="degree" className="flex items-center gap-1">
                Degree <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.degree}
                onValueChange={(value) => handleChange("degree", value)}
              >
                <SelectTrigger
                  className={`w-full ${errors.degree ? "border-red-500" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select degree level" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.degree && (
                <p className="text-sm text-red-500">{errors.degree}</p>
              )}
            </div>

            {/* Field of Study */}
            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy" className="flex items-center gap-1">
                Field of Study <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
                  placeholder="e.g., Computer Science, Business Administration"
                  className={`pl-10 ${
                    errors.fieldOfStudy ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.fieldOfStudy && (
                <p className="text-sm text-red-500">{errors.fieldOfStudy}</p>
              )}
            </div>
          </div>
        </div>

        {/* Institution */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <School className="h-5 w-5 text-[rgb(96,57,187)]" />
            Institution Details
          </h3>

          <div className="space-y-2">
            <Label htmlFor="institution" className="flex items-center gap-1">
              Institution <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <School className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => handleChange("institution", e.target.value)}
                placeholder="e.g., University of Example, College Name"
                className={`pl-10 ${
                  errors.institution ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.institution && (
              <p className="text-sm text-red-500">{errors.institution}</p>
            )}
          </div>
        </div>

        {/* Duration of Study */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[rgb(96,57,187)]" />
            Duration of Study
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Year */}
            <div className="space-y-2">
              <Label htmlFor="startYear" className="flex items-center gap-1">
                Start Year <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Select
                  value={formData.startYear.toString()}
                  onValueChange={(value) =>
                    handleChange("startYear", parseInt(value))
                  }
                >
                  <SelectTrigger
                    className={`w-full pl-10 ${
                      errors.startYear ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select start year" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateYearOptions().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.startYear && (
                <p className="text-sm text-red-500">{errors.startYear}</p>
              )}
            </div>

            {/* End Year */}
            <div className="space-y-2">
              <Label htmlFor="endYear" className="flex items-center gap-1">
                End Year <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select
                    value={getEndYearValue()}
                    onValueChange={handleEndYearChange}
                  >
                    <SelectTrigger
                      className={`w-full pl-10 ${
                        errors.endYear ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select end year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ONGOING_VALUE}>Ongoing</SelectItem>
                      {generateYearOptions().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ongoing"
                    checked={isOngoing}
                    onChange={(e) => {
                      setIsOngoing(e.target.checked);
                      if (e.target.checked) {
                        // Clear end year error when ongoing is checked
                        if (errors.endYear) {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.endYear;
                            return newErrors;
                          });
                        }
                      } else {
                        // Reset to current year when unchecking
                        handleChange("endYear", new Date().getFullYear());
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[rgb(96,57,187)] focus:ring-[rgb(96,57,187)]"
                  />
                  <Label htmlFor="ongoing" className="ml-2 cursor-pointer">
                    Ongoing
                  </Label>
                </div>
              </div>
              {errors.endYear && !isOngoing && (
                <p className="text-sm text-red-500">{errors.endYear}</p>
              )}
              {isOngoing && (
                <p className="text-sm text-green-600">
                  ✓ This education is marked as ongoing
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-[rgb(96,57,187)]" />
            Academic Performance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade */}
            <div className="space-y-2">
              <Label htmlFor="grade">
                Grade <span className="text-sm text-gray-500">(Optional)</span>
              </Label>
              <div className="relative">
                <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => handleChange("grade", e.target.value)}
                  placeholder="e.g., 3.8, 85%, A+"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Grade Scale */}
            <div className="space-y-2">
              <Label htmlFor="gradeScale">
                Grade Scale{" "}
                <span className="text-sm text-gray-500">(Optional)</span>
              </Label>
              <Select
                value={formData.gradeScale}
                onValueChange={(value) => handleChange("gradeScale", value)}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Select grade scale" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Not specified</SelectItem>
                  {GRADE_SCALE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[rgb(96,57,187)]" />
            Additional Information
          </h3>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-sm text-gray-500">(Optional)</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Additional information about your education, such as honors, thesis topics, special achievements, etc."
                className="pl-10 min-h-[100px] resize-none"
                onKeyPress={handleKeyPress}
              />
            </div>
            <p className="text-sm text-gray-500">
              You can add details about your academic achievements, projects, or
              any other relevant information.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  degree: "",
                  fieldOfStudy: "",
                  institution: "",
                  startYear: new Date().getFullYear(),
                  endYear: new Date().getFullYear(),
                  grade: "",
                  gradeScale: "",
                  description: "",
                });
                setIsOngoing(false);
                setErrors({});
              }}
              disabled={isSubmitting || isCreating}
              className="rounded-xl px-8"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isCreating}
              className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] hover:from-[rgb(86,47,177)] hover:to-[rgb(110,70,190)] rounded-xl px-8 shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting || isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Education Record"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
