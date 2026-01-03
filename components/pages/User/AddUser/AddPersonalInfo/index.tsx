"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X, Plus, Camera, Upload } from "lucide-react";
import { SystemRole } from "@/types";

interface PersonalInfoProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  currentUserRole?: string;
}

interface RoleOption {
  value: SystemRole;
  label: string;
}

export default function PersonalInfo({
  formData: parentFormData,
  onFormDataChange,
  currentUserRole = "ADMIN",
}: PersonalInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localFormData, setLocalFormData] = useState({
    email: parentFormData.email || "",
    password: parentFormData.password || "",
    firstname: parentFormData.firstname || "",
    lastname: parentFormData.lastname || "",
    gender: parentFormData.gender || "male",
    city: parentFormData.city || "",
    province: parentFormData.province || "",
    country: parentFormData.country || "",
    phone: parentFormData.phone || "",
    postalCode: parentFormData.postalCode || "",
    department: parentFormData.department || "",
    projects: parentFormData.projects || ([] as string[]),
    positions: parentFormData.positions || ([] as string[]),
    systemRole: parentFormData.systemRole || ("EMPLOYEE" as SystemRole),
  });

  const [newProject, setNewProject] = useState<string>("");
  const [newPosition, setNewPosition] = useState<string>("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync local state when parent formData changes (only when parent updates)
  useEffect(() => {
    setLocalFormData({
      email: parentFormData.email || "",
      password: parentFormData.password || "",
      firstname: parentFormData.firstname || "",
      lastname: parentFormData.lastname || "",
      gender: parentFormData.gender || "male",
      city: parentFormData.city || "",
      province: parentFormData.province || "",
      country: parentFormData.country || "",
      phone: parentFormData.phone || "",
      postalCode: parentFormData.postalCode || "",
      department: parentFormData.department || "",
      projects: parentFormData.projects || [],
      positions: parentFormData.positions || [],
      systemRole: parentFormData.systemRole || "EMPLOYEE",
    });
  }, [parentFormData]);

  // Debounced update to parent - prevent infinite loop
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if there are actual changes
      const hasChanges =
        JSON.stringify(localFormData) !==
          JSON.stringify({
            email: parentFormData.email || "",
            password: parentFormData.password || "",
            firstname: parentFormData.firstname || "",
            lastname: parentFormData.lastname || "",
            gender: parentFormData.gender || "male",
            city: parentFormData.city || "",
            province: parentFormData.province || "",
            country: parentFormData.country || "",
            phone: parentFormData.phone || "",
            postalCode: parentFormData.postalCode || "",
            department: parentFormData.department || "",
            projects: parentFormData.projects || [],
            positions: parentFormData.positions || [],
            systemRole: parentFormData.systemRole || "EMPLOYEE",
          }) || selectedFile !== null;

      if (hasChanges) {
        onFormDataChange({
          ...localFormData,
          profilePicture: selectedFile,
        });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localFormData, selectedFile, parentFormData, onFormDataChange]);

  const handleChange = useCallback((field: string, value: string) => {
    setLocalFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Get available roles based on current user
  const getAvailableRoles = useCallback((): RoleOption[] => {
    if (currentUserRole === "ADMIN") {
      return [
        { value: "EMPLOYEE" as SystemRole, label: "Employee" },
        { value: "PROJECT_MANAGER" as SystemRole, label: "Project Manager" },
        {
          value: "OPERATION_MANAGER" as SystemRole,
          label: "Operation Manager",
        },
        { value: "CEO" as SystemRole, label: "CEO" },
        { value: "CTO" as SystemRole, label: "CTO" },
        { value: "HRM" as SystemRole, label: "HR Manager" },
        { value: "ADMIN" as SystemRole, label: "Admin" },
        { value: "STAFF" as SystemRole, label: "STAFF" },
        { value: "INTERNS" as SystemRole, label: "INTERNS" },
      ];
    } else if (currentUserRole === "HRM") {
      return [
        { value: "EMPLOYEE" as SystemRole, label: "Employee" },
        { value: "PROJECT_MANAGER" as SystemRole, label: "Project Manager" },
        { value: "CEO" as SystemRole, label: "CEO" },
        { value: "CTO" as SystemRole, label: "CTO" },
        {
          value: "OPERATION_MANAGER" as SystemRole,
          label: "Operation Manager",
        },
        { value: "STAFF" as SystemRole, label: "STAFF" },
        { value: "INTERNS" as SystemRole, label: "INTERNS" },
      ];
    } else {
      return [
        { value: "EMPLOYEE" as SystemRole, label: "Employee" },
        { value: "PROJECT_MANAGER" as SystemRole, label: "Project Manager" },
        {
          value: "OPERATION_MANAGER" as SystemRole,
          label: "Operation Manager",
        },
      ];
    }
  }, [currentUserRole]);

  // Profile picture handling
  const handleProfilePictureChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("Please select a valid image file");
          return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert("Image size should be less than 5MB");
          return;
        }

        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const removeProfilePicture = useCallback(() => {
    setSelectedFile(null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Array management functions
  const addProject = useCallback(() => {
    if (
      newProject.trim() &&
      !localFormData.projects.includes(newProject.trim())
    ) {
      const updatedProjects = [...localFormData.projects, newProject.trim()];
      setLocalFormData((prev) => ({
        ...prev,
        projects: updatedProjects,
      }));
      setNewProject("");
    }
  }, [newProject, localFormData.projects]);

  const removeProject = useCallback(
    (index: number) => {
      const updatedProjects = localFormData.projects.filter(
        (_: string, i: number) => i !== index
      );
      setLocalFormData((prev) => ({
        ...prev,
        projects: updatedProjects,
      }));
    },
    [localFormData.projects]
  );

  const addPosition = useCallback(() => {
    if (
      newPosition.trim() &&
      !localFormData.positions.includes(newPosition.trim())
    ) {
      const updatedPositions = [...localFormData.positions, newPosition.trim()];
      setLocalFormData((prev) => ({
        ...prev,
        positions: updatedPositions,
      }));
      setNewPosition("");
    }
  }, [newPosition, localFormData.positions]);

  const removePosition = useCallback(
    (index: number) => {
      const updatedPositions = localFormData.positions.filter(
        (_: string, i: number) => i !== index
      );
      setLocalFormData((prev) => ({
        ...prev,
        positions: updatedPositions,
      }));
    },
    [localFormData.positions]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent, type: "project" | "position") => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (type === "project") {
          addProject();
        } else {
          addPosition();
        }
      }
    },
    [addProject, addPosition]
  );

  const roleOptions = getAvailableRoles();

  return (
    <div className="bg-white p-10 rounded-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          General Information
        </h2>
        <p className="text-gray-600">Basic details about the user</p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <div className="flex flex-col items-start gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
              </div>
              {profilePreview && (
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />

            <Button
              type="button"
              onClick={triggerFileInput}
              variant="outline"
              className="rounded-xl"
            >
              <Upload className="h-4 w-4 mr-2" />
              {profilePreview ? "Change Picture" : "Upload Picture"}
            </Button>

            <p className="text-xs text-gray-500">
              Recommended: Square image, max 5MB
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Role */}
          <div className="space-y-2">
            <Label htmlFor="systemRole">System Role</Label>
            <Select
              value={localFormData.systemRole}
              onValueChange={(value) => handleChange("systemRole", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role: RoleOption) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstname">First Name *</Label>
            <Input
              id="firstname"
              value={localFormData.firstname}
              onChange={(e) => handleChange("firstname", e.target.value)}
              required
              placeholder="John"
              className="py-2"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastname">Last Name *</Label>
            <Input
              id="lastname"
              value={localFormData.lastname}
              onChange={(e) => handleChange("lastname", e.target.value)}
              required
              placeholder="Doe"
              className="py-2"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={localFormData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              placeholder="john@example.com"
              className="py-2"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={localFormData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              placeholder="••••••••"
              className="py-2"
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={localFormData.gender}
                onValueChange={(value) => handleChange("gender", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={localFormData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                placeholder="e.g., Engineering, Marketing"
                className="py-2"
              />
            </div>
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={localFormData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="City"
                className="py-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={localFormData.province}
                onChange={(e) => handleChange("province", e.target.value)}
                placeholder="Province"
                className="py-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={localFormData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="Country"
                className="py-2"
              />
            </div>
            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={localFormData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Phone number"
                className="py-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={localFormData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="Postal code"
                className="py-2"
              />
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-2">
          <Label>Projects</Label>
          <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-gray-200 rounded-md">
            {localFormData.projects.length > 0 ? (
              localFormData.projects.map((project: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 flex items-center gap-1"
                >
                  {project}
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-400">No projects added</span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "project")}
              placeholder="Add a project"
            />
            <Button
              type="button"
              onClick={addProject}
              variant="outline"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Positions */}
        <div className="space-y-2">
          <Label>Positions</Label>
          <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-gray-200 rounded-md">
            {localFormData.positions.length > 0 ? (
              localFormData.positions.map((position: string, index: number) => (
                <Badge
                  key={index}
                  variant="default"
                  className="pl-3 pr-1 py-1 flex items-center gap-1 bg-[#6039BB]"
                >
                  {position}
                  <button
                    type="button"
                    onClick={() => removePosition(index)}
                    className="ml-1 hover:bg-primary/80 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-400">No positions added</span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "position")}
              placeholder="Add a position"
            />
            <Button
              type="button"
              onClick={addPosition}
              variant="outline"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
