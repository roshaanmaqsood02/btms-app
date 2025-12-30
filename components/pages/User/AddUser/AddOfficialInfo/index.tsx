"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useGetUsersQuery } from "@/redux/services/userApi";
import { CreateContractRequest } from "@/redux/types/contract.type";

interface OfficialInfoProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  currentUserRole?: string;
}

type EmployeeStatus =
  | "EMPLOYEED"
  | "CONTRACT_TERMINATED"
  | "RESIGNED"
  | "ON_LEAVE";
type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
type Shift = "MORNING" | "EVENING" | "NIGHT" | "FLEXIBLE";
type WorkLocation = "ON_SITE" | "REMOTE" | "HYBRID";

export default function OfficialInfo({
  formData: parentFormData,
  onFormDataChange,
  currentUserRole = "ADMIN",
}: OfficialInfoProps) {
  const [localFormData, setLocalFormData] = useState<CreateContractRequest>({
    employeeStatus: parentFormData.employeeStatus || "EMPLOYEED",
    jobType: parentFormData.jobType || "FULL_TIME",
    department: parentFormData.department || "",
    designation: parentFormData.designation || "",
    position: parentFormData.position || "",
    reportingHr: parentFormData.reportingHr || "",
    reportingManager: parentFormData.reportingManager || "",
    reportingTeamLead: parentFormData.reportingTeamLead || "",
    joiningDate: parentFormData.joiningDate || "",
    contractStart: parentFormData.contractStart || "",
    contractEnd: parentFormData.contractEnd || "",
    shift: parentFormData.shift || "MORNING",
    workLocation: parentFormData.workLocation || "ON_SITE",
  });

  // Get HR users for reportingHr dropdown
  const { data: usersData } = useGetUsersQuery({
    page: 1,
    limit: 100,
    search: "",
    sortBy: "firstname",
    sortOrder: "asc",
  });

  // Sync local state when parent formData changes
  useEffect(() => {
    setLocalFormData({
      employeeStatus: parentFormData.employeeStatus || "EMPLOYEED",
      jobType: parentFormData.jobType || "FULL_TIME",
      department: parentFormData.department || "",
      designation: parentFormData.designation || "",
      position: parentFormData.position || "",
      reportingHr: parentFormData.reportingHr || "",
      reportingManager: parentFormData.reportingManager || "",
      reportingTeamLead: parentFormData.reportingTeamLead || "",
      joiningDate: parentFormData.joiningDate || "",
      contractStart: parentFormData.contractStart || "",
      contractEnd: parentFormData.contractEnd || "",
      shift: parentFormData.shift || "MORNING",
      workLocation: parentFormData.workLocation || "ON_SITE",
    });
  }, [parentFormData]);

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if there are actual changes
      const hasChanges =
        JSON.stringify(localFormData) !==
        JSON.stringify({
          employeeStatus: parentFormData.employeeStatus || "EMPLOYEED",
          jobType: parentFormData.jobType || "FULL_TIME",
          department: parentFormData.department || "",
          designation: parentFormData.designation || "",
          position: parentFormData.position || "",
          reportingHr: parentFormData.reportingHr || "",
          reportingManager: parentFormData.reportingManager || "",
          reportingTeamLead: parentFormData.reportingTeamLead || "",
          joiningDate: parentFormData.joiningDate || "",
          contractStart: parentFormData.contractStart || "",
          contractEnd: parentFormData.contractEnd || "",
          shift: parentFormData.shift || "MORNING",
          workLocation: parentFormData.workLocation || "ON_SITE",
        });

      if (hasChanges) {
        onFormDataChange(localFormData);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localFormData, parentFormData, onFormDataChange]);

  const handleChange = useCallback(
    (field: keyof CreateContractRequest, value: string | number | Date) => {
      setLocalFormData((prev) => ({
        ...prev,
        [field]: value instanceof Date ? format(value, "yyyy-MM-dd") : value,
      }));
    },
    []
  );

  const handleDateChange = useCallback(
    (
      field: "joiningDate" | "contractStart" | "contractEnd",
      date: Date | undefined
    ) => {
      if (date) {
        handleChange(field, date);
      }
    },
    [handleChange]
  );

  // Filter HR users (users with HRM role)
  const hrUsers =
    usersData?.data?.filter((user: any) => user.systemRole === "HRM") || [];

  return (
    <div className="bg-white p-10 rounded-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Official Information
        </h2>
        <p className="text-gray-600">Employment and contract details</p>
      </div>

      <div className="space-y-6">
        {/* Employment Status & Job Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="employeeStatus">Employment Status *</Label>
            <Select
              value={localFormData.employeeStatus}
              onValueChange={(value) =>
                handleChange("employeeStatus", value as EmployeeStatus)
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEED">Employeed</SelectItem>
                <SelectItem value="CONTRACT_TERMINATED">
                  Contract Terminated
                </SelectItem>
                <SelectItem value="RESIGNED">Resigned</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobType">Job Type *</Label>
            <Select
              value={localFormData.jobType}
              onValueChange={(value) =>
                handleChange("jobType", value as JobType)
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_TIME">Full Time</SelectItem>
                <SelectItem value="PART_TIME">Part Time</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
                <SelectItem value="INTERN">Intern</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Department, Designation & Position */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              value={localFormData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              required
              placeholder="e.g., Engineering"
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation *</Label>
            <Input
              id="designation"
              value={localFormData.designation}
              onChange={(e) => handleChange("designation", e.target.value)}
              required
              placeholder="e.g., Software Engineer"
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              value={localFormData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              required
              placeholder="e.g., Senior Developer"
              className="py-2"
            />
          </div>
        </div>

        {/* Reporting Structure */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Reporting Structure
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reportingHr">Reporting HR</Label>
              <Select
                value={localFormData.reportingHr}
                onValueChange={(value) => handleChange("reportingHr", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select HR Manager" />
                </SelectTrigger>
                <SelectContent>
                  {hrUsers.map((hr: any) => (
                    <SelectItem key={hr.id} value={hr.id.toString()}>
                      {hr.firstname} {hr.lastname} ({hr.email})
                    </SelectItem>
                  ))}
                  <SelectItem value="none">No HR Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportingManager">Reporting Manager</Label>
              <Input
                id="reportingManager"
                value={localFormData.reportingManager}
                onChange={(e) =>
                  handleChange("reportingManager", e.target.value)
                }
                placeholder="Manager's name or email"
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportingTeamLead">Reporting Team Lead</Label>
              <Input
                id="reportingTeamLead"
                value={localFormData.reportingTeamLead}
                onChange={(e) =>
                  handleChange("reportingTeamLead", e.target.value)
                }
                placeholder="Team Lead's name or email"
                className="py-2"
              />
            </div>
          </div>
        </div>

        {/* Dates Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Important Dates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Joining Date */}
            <div className="space-y-2">
              <Label>Joining Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal py-2",
                      !localFormData.joiningDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFormData.joiningDate ? (
                      format(new Date(localFormData.joiningDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      localFormData.joiningDate
                        ? new Date(localFormData.joiningDate)
                        : undefined
                    }
                    onSelect={(date) => handleDateChange("joiningDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Contract Start Date */}
            <div className="space-y-2">
              <Label>Contract Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal py-2",
                      !localFormData.contractStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFormData.contractStart ? (
                      format(new Date(localFormData.contractStart), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      localFormData.contractStart
                        ? new Date(localFormData.contractStart)
                        : undefined
                    }
                    onSelect={(date) => handleDateChange("contractStart", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Contract End Date */}
            <div className="space-y-2">
              <Label>Contract End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal py-2",
                      !localFormData.contractEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFormData.contractEnd ? (
                      format(new Date(localFormData.contractEnd), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      localFormData.contractEnd
                        ? new Date(localFormData.contractEnd)
                        : undefined
                    }
                    onSelect={(date) => handleDateChange("contractEnd", date)}
                    initialFocus
                    disabled={(date) => {
                      if (localFormData.contractStart) {
                        return date < new Date(localFormData.contractStart);
                      }
                      return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Work Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shift */}
            <div className="space-y-2">
              <Label htmlFor="shift">Shift *</Label>
              <Select
                value={localFormData.shift}
                onValueChange={(value) => handleChange("shift", value as Shift)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">Morning</SelectItem>
                  <SelectItem value="EVENING">Evening</SelectItem>
                  <SelectItem value="NIGHT">Night</SelectItem>
                  <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Work Location */}
            <div className="space-y-2">
              <Label htmlFor="workLocation">Work Location *</Label>
              <Select
                value={localFormData.workLocation}
                onValueChange={(value) =>
                  handleChange("workLocation", value as WorkLocation)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ON_SITE">On Site</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Additional Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee ID */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={parentFormData.employeeId || ""}
                onChange={(e) =>
                  handleChange("employeeId" as any, e.target.value)
                }
                placeholder="e.g., EMP00123"
                className="py-2"
              />
            </div>

            {/* Attendance ID */}
            <div className="space-y-2">
              <Label htmlFor="attendanceId">Attendance ID</Label>
              <Input
                id="attendanceId"
                value={parentFormData.attendanceId || ""}
                onChange={(e) =>
                  handleChange("attendanceId" as any, e.target.value)
                }
                placeholder="e.g., ATT00123"
                className="py-2"
              />
            </div>
          </div>

          {/* Salary */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="salary">Salary (per month)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="salary"
                type="number"
                value={parentFormData.salary || ""}
                onChange={(e) => handleChange("salary" as any, e.target.value)}
                placeholder="e.g., 50000"
                className="py-2"
              />
              <span className="text-gray-500 whitespace-nowrap">per month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
