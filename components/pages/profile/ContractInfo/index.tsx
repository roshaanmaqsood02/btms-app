"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MapPin,
  Calendar,
  Briefcase,
  User,
  Building,
  Users,
  Clock,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetActiveContractQuery } from "@/redux/services/contractApi";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { useAppSelector } from "@/redux/hook";
import { EditContractDialog } from "../components/EditContractDetails";
import { EmployeeContract } from "@/redux/types/contract.type";
import { cn } from "@/lib/utils";

// Constants
const ALLOWED_EDIT_ROLES = ["ADMIN", "HRM", "OPERATION_MANAGER"];

// Status configurations
const STATUS_CONFIG = {
  EMPLOYEED: { label: "Employeed", variant: "default" as const },
  CONTRACT_TERMINATED: { label: "Terminated", variant: "destructive" as const },
  RESIGNED: { label: "Resigned", variant: "destructive" as const },
  ON_LEAVE: { label: "On Leave", variant: "warning" as const },
};

// Job type configurations
const JOB_TYPE_CONFIG = {
  FULL_TIME: { label: "Full Time", variant: "default" as const },
  PART_TIME: { label: "Part Time", variant: "secondary" as const },
  CONTRACT: { label: "Contract", variant: "outline" as const },
  INTERN: { label: "Intern", variant: "success" as const },
};

// Location configurations
const LOCATION_CONFIG = {
  ON_SITE: { label: "On Site", variant: "secondary" as const },
  REMOTE: { label: "Remote", variant: "outline" as const },
  HYBRID: { label: "Hybrid", variant: "default" as const },
};

// Shift configurations
const SHIFT_CONFIG = {
  MORNING: { label: "Morning", variant: "secondary" as const },
  EVENING: { label: "Evening", variant: "outline" as const },
  NIGHT: { label: "Night", variant: "destructive" as const },
  FLEXIBLE: { label: "Flexible", variant: "success" as const },
};

// Card icon configurations
const CARD_ICON_CONFIG = {
  jobType: { icon: Briefcase, color: "text-blue-600" },
  designation: { icon: User, color: "text-purple-600" },
  department: { icon: Building, color: "text-indigo-600" },
  position: { icon: Briefcase, color: "text-green-600" },
  workLocation: { icon: MapPin, color: "text-red-600" },
  shift: { icon: Clock, color: "text-orange-600" },
  joiningDate: { icon: Calendar, color: "text-teal-600" },
  contractStart: { icon: Calendar, color: "text-blue-600" },
  contractEnd: { icon: Calendar, color: "text-red-600" },
  reportingManager: { icon: Users, color: "text-purple-600" },
  reportingTeamLead: { icon: Users, color: "text-indigo-600" },
  reportingHr: { icon: Users, color: "text-green-600" },
  id: { icon: Briefcase, color: "text-gray-600" },
  terminationDate: { icon: Calendar, color: "text-destructive" },
} as const;

// Types
interface ContractInfoProps {
  userId?: number | string;
  canEdit?: boolean;
  onEdit?: () => void;
}

interface ContractInfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

// Helper Components
const ContractInfoCard: React.FC<ContractInfoCardProps> = ({
  icon,
  label,
  value,
  badge,
  className,
}) => (
  <Card className={cn("hover:shadow-md transition-shadow", className)}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
        {badge && <div className="mt-1">{badge}</div>}
      </div>
    </CardContent>
  </Card>
);

const LoadingState = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-20" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
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
      Failed to load contract information.
      <Button onClick={onRetry} variant="outline" size="sm" className="ml-4">
        Retry
      </Button>
    </AlertDescription>
  </Alert>
);

const NoContractState = ({ userId }: { userId: number | string }) => (
  <Alert>
    <AlertDescription>
      No active contract found for user ID: {userId}
    </AlertDescription>
  </Alert>
);

// Helper Functions
const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status: string) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    label: status,
    variant: "secondary" as const,
  };
  return <Badge className="capitalize">{config.label}</Badge>;
};

const getJobTypeBadge = (jobType: string) => {
  const config = JOB_TYPE_CONFIG[jobType as keyof typeof JOB_TYPE_CONFIG] || {
    label: jobType,
    variant: "secondary" as const,
  };
  return <Badge className="capitalize">{config.label}</Badge>;
};

const getLocationBadge = (location: string) => {
  const config = LOCATION_CONFIG[location as keyof typeof LOCATION_CONFIG] || {
    label: location,
    variant: "secondary" as const,
  };
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
};

const getShiftBadge = (shift: string) => {
  const config = SHIFT_CONFIG[shift as keyof typeof SHIFT_CONFIG] || {
    label: shift,
    variant: "secondary" as const,
  };
  return <Badge className="capitalize">{config.label}</Badge>;
};

// Main Component
export default function ContractInfo({
  userId,
  canEdit = true,
  onEdit,
}: ContractInfoProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const currentUser = useAppSelector(selectCurrentUser);
  const targetUserId = userId || currentUser?.id;

  const {
    data: contract,
    isLoading,
    error,
    isError,
    refetch,
  } = useGetActiveContractQuery(targetUserId!, {
    skip: !targetUserId,
  });

  // Check if user can edit contracts
  const canEditContract = currentUser
    ? ALLOWED_EDIT_ROLES.includes(currentUser.systemRole || "")
    : false;

  // Loading state
  if (isLoading) return <LoadingState />;

  // Error state
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  // No contract state
  if (!contract) return <NoContractState userId={targetUserId!} />;

  const handleEditContract = () => {
    if (contract) {
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateSuccess = async (updatedContract: EmployeeContract) => {
    refetch();
    console.log("Contract updated successfully:", updatedContract);
  };

  const contractCards = [
    {
      key: "jobType",
      label: "Job Type",
      value: contract.jobType.replace("_", " "),
      badge: getJobTypeBadge(contract.jobType),
    },
    {
      key: "designation",
      label: "Designation",
      value: contract.designation,
    },
    {
      key: "department",
      label: "Department",
      value: contract.department,
    },
    {
      key: "position",
      label: "Position",
      value: contract.position,
    },
    {
      key: "workLocation",
      label: "Work Location",
      value: contract.workLocation.replace("_", " "),
      badge: getLocationBadge(contract.workLocation),
    },
    {
      key: "shift",
      label: "Shift",
      value: contract.shift,
      badge: getShiftBadge(contract.shift),
    },
    {
      key: "joiningDate",
      label: "Joining Date",
      value: formatDate(contract.joiningDate),
    },
    {
      key: "contractStart",
      label: "Contract Start",
      value: formatDate(contract.contractStart),
    },
    {
      key: "contractEnd",
      label: "Contract End",
      value: formatDate(contract.contractEnd),
    },
    {
      key: "reportingManager",
      label: "Reporting Manager",
      value: contract.reportingManager || "Not specified",
    },
    {
      key: "reportingTeamLead",
      label: "Reporting Team Lead",
      value: contract.reportingTeamLead || "Not specified",
    },
    {
      key: "reportingHr",
      label: "Reporting HR",
      value: contract.reportingHr || "Not specified",
    },
    ...(contract.id
      ? [
          {
            key: "id",
            label: "Contract ID",
            value: `#${contract.id}`,
          },
        ]
      : []),
    ...(contract.terminationDate
      ? [
          {
            key: "terminationDate",
            label: "Termination Date",
            value: formatDate(contract.terminationDate),
            className: "border-destructive/20",
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Contract Information
            </h2>
            <p className="text-gray-600 mt-1">
              Active employment contract details
            </p>
          </div>
          {canEdit && canEditContract && (
            <Button onClick={handleEditContract} variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Contract Status Banner */}
        <Alert
          className={cn(
            "border-l-4",
            contract.employeeStatus === "EMPLOYEED"
              ? "border-[#6039BB] bg-purple-50"
              : "border-yellow-500 bg-yellow-50"
          )}
        >
          <AlertDescription className="flex items-center justify-between">
            <span className="font-medium">
              {contract.employeeStatus === "EMPLOYEED"
                ? "Currently Active Contract"
                : `Contract Status: ${contract.employeeStatus}`}
            </span>
            {getStatusBadge(contract.employeeStatus)}
          </AlertDescription>
        </Alert>

        {/* Contract Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractCards.map((card) => {
            const Icon =
              CARD_ICON_CONFIG[card.key as keyof typeof CARD_ICON_CONFIG]
                ?.icon || Briefcase;
            const iconColor =
              CARD_ICON_CONFIG[card.key as keyof typeof CARD_ICON_CONFIG]
                ?.color || "text-gray-600";

            return (
              <ContractInfoCard
                key={card.key}
                icon={<Icon className={`h-5 w-5 ${iconColor}`} />}
                label={card.label}
                value={card.value}
                badge={card.badge}
                className={card.className}
              />
            );
          })}
        </div>

        {/* Additional Notes or Actions */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Last updated:{" "}
            {contract.updatedAt ? formatDate(contract.updatedAt) : "N/A"}
          </div>
          <div>
            Created:{" "}
            {contract.createdAt ? formatDate(contract.createdAt) : "N/A"}
          </div>
        </div>
      </div>

      {/* Edit Contract Dialog */}
      <EditContractDialog
        contract={contract}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </>
  );
}
