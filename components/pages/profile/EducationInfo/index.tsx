"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  GraduationCap,
  Calendar,
  School,
  Award,
  FileText,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetUserEducationsQuery } from "@/redux/services/educationApi";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { useAppSelector } from "@/redux/hook";
import { Education } from "@/redux/types/education.type";

import { cn } from "@/lib/utils";
import { EditEducationDialog } from "../components/EditEducationDetails";

// Constants
const DEGREE_COLORS = {
  "High School": "bg-blue-100 text-blue-800",
  "Associate Degree": "bg-purple-100 text-purple-800",
  "Bachelor's Degree": "bg-green-100 text-green-800",
  "Master's Degree": "bg-yellow-100 text-yellow-800",
  Doctorate: "bg-red-100 text-red-800",
  Diploma: "bg-indigo-100 text-indigo-800",
  Certificate: "bg-pink-100 text-pink-800",
  Other: "bg-gray-100 text-gray-800",
} as const;

// Types
interface EducationInfoProps {
  userId?: number | string;
  canEdit?: boolean; // Add this
  onEducationUpdated?: () => void;
}

interface EducationInfoCardProps {
  education: Education;
  className?: string;
  onEdit?: (education: Education) => void; // Add this
}

// Helper Functions
const safeFormatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";

  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid date";

    return format(date, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

// Helper Components
const LoadingState = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-20" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-48" />
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
      Failed to load education information.
      <Button onClick={onRetry} variant="outline" size="sm" className="ml-4">
        Retry
      </Button>
    </AlertDescription>
  </Alert>
);

const NoEducationState = ({ userId }: { userId: number | string }) => (
  <Alert>
    <AlertDescription>
      No education records found for user ID: {userId}
    </AlertDescription>
  </Alert>
);

const EducationInfoCard: React.FC<EducationInfoCardProps> = ({
  education,
  className,
  onEdit,
}) => {
  const getDurationText = () => {
    if (education.endYear) {
      return `${education.startYear} - ${education.endYear}`;
    }
    return `${education.startYear} - Present`;
  };

  const getDegreeColor = () => {
    return (
      DEGREE_COLORS[education.degree as keyof typeof DEGREE_COLORS] ||
      DEGREE_COLORS.Other
    );
  };

  const calculateDuration = () => {
    if (education.endYear) {
      return education.endYear - education.startYear;
    }
    const currentYear = new Date().getFullYear();
    return currentYear - education.startYear;
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with Degree and Status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {education.degree}
                </h3>
                <p className="text-sm text-gray-600">
                  {education.fieldOfStudy}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={education.endYear ? "default" : "secondary"}>
                {education.endYear ? "Completed" : "Ongoing"}
              </Badge>
              {onEdit && (
                <Button
                  onClick={() => onEdit(education)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Institution and Details */}
          <div className="space-y-3 pl-2">
            <div className="flex items-center gap-3">
              <School className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 font-medium">
                {education.institution}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{getDurationText()}</span>
                <Badge variant="outline" className="text-xs">
                  {calculateDuration()} year
                  {calculateDuration() !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>

            {/* Grade Information */}
            {education.grade && (
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Grade:</span>
                  <span className="font-semibold">{education.grade}</span>
                  {education.gradeScale && (
                    <span className="text-sm text-gray-500">
                      ({education.gradeScale})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {education.description && (
              <div className="pt-3 border-t">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    {education.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Dates - FIXED: using safeFormatDate */}
          <div className="pt-4 border-t text-xs text-gray-500 flex justify-between">
            <span>Updated: {safeFormatDate(education.updatedAt)}</span>
            <span>ID: #{education.id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function EducationInfo({
  userId,
  canEdit = false,
  onEducationUpdated,
}: EducationInfoProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const targetUserId = userId || currentUser?.id;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(
    null
  );

  const {
    data: educations = [],
    isLoading,
    error,
    isError,
    refetch,
  } = useGetUserEducationsQuery(targetUserId!, {
    skip: !targetUserId,
  });

  const handleEditEducation = (education: Education) => {
    if (canEdit) {
      setSelectedEducation(education);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateSuccess = async (updatedEducation: Education) => {
    await refetch();
    console.log("Education updated successfully:", updatedEducation);

    // Call the parent callback to refresh the entire profile
    if (onEducationUpdated) {
      onEducationUpdated();
    }
  };

  // Loading state
  if (isLoading) return <LoadingState />;

  // Error state
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  // No education state
  if (educations.length === 0)
    return <NoEducationState userId={targetUserId!} />;

  // Sort educations by endYear (ongoing first, then most recent completed)
  const sortedEducations = [...educations].sort((a, b) => {
    // Ongoing studies first
    if (!a.endYear && b.endYear) return -1;
    if (a.endYear && !b.endYear) return 1;

    // Then by start year (most recent first)
    return b.startYear - a.startYear;
  });

  // Calculate statistics
  const totalYears = educations.reduce((total, edu) => {
    const endYear = edu.endYear || new Date().getFullYear();
    return total + (endYear - edu.startYear);
  }, 0);

  const highestDegree = educations.reduce((highest, current) => {
    const degreeOrder = {
      Doctorate: 7,
      "Master's Degree": 6,
      "Bachelor's Degree": 5,
      "Associate Degree": 4,
      Diploma: 3,
      Certificate: 2,
      "High School": 1,
      Other: 0,
    };

    const currentOrder =
      degreeOrder[current.degree as keyof typeof degreeOrder] || 0;
    const highestOrder =
      degreeOrder[highest.degree as keyof typeof degreeOrder] || 0;

    return currentOrder > highestOrder ? current : highest;
  }, educations[0]);

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Education Information
            </h2>
            <p className="text-gray-600 mt-1">
              Academic qualifications and educational background
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {educations.length} record{educations.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Education Summary Banner */}
        {educations.length > 0 && (
          <Alert className="border-l-4 border-[#6039BB] bg-purple-50">
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">
                  Highest Qualification: {highestDegree.degree}
                </span>
                <p className="text-sm text-[#6039BB] mt-1">
                  Total {totalYears} year{totalYears !== 1 ? "s" : ""} of formal
                  education
                </p>
              </div>
              <Badge variant="secondary" className="ml-4 bg-black text-white">
                {educations.filter((e) => !e.endYear).length > 0
                  ? "Active Student"
                  : "Education Complete"}
              </Badge>
            </AlertDescription>
          </Alert>
        )}

        {/* Education Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedEducations.map((education) => (
            <EducationInfoCard
              key={education.id}
              education={education}
              onEdit={canEdit ? handleEditEducation : undefined}
            />
          ))}
        </div>

        {/* Education Summary Stats */}
        {educations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {educations.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Years Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalYears}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Ongoing Studies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {educations.filter((e) => !e.endYear).length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Unique Institutions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(educations.map((e) => e.institution)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <div>
            Data last refreshed: {safeFormatDate(new Date().toISOString())}
          </div>
          <div>
            Showing {educations.length} of {educations.length} records
          </div>
        </div>
      </div>

      {/* Edit Education Dialog */}
      {selectedEducation && (
        <EditEducationDialog
          education={selectedEducation}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}
