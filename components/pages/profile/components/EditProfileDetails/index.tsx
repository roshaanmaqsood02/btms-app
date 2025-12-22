"use client";

import { useState, useEffect } from "react";
import { useUpdateUserMutation } from "@/redux/services/userApi"; // Changed from authApi
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  FolderKanban,
  Award,
  X,
  Plus,
  User,
  MapPin,
  Phone,
  Briefcase,
  Calendar,
  Heart,
  Droplet,
  CreditCard,
} from "lucide-react";

interface UserProfile {
  id?: string | number; // Add id
  name?: string;
  gender?: string;
  city?: string;
  country?: string;
  phone?: string;
  postalCode?: string;
  department?: string;
  dateOfBirth?: string | Date; // Change to accept string or Date
  maritalStatus?: string;
  bloodGroup?: string;
  cnic?: string;
  projects?: string[];
  positions?: string[];
}

interface EditProfileDialogProps {
  userId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: UserProfile;
  onUpdateSuccess?: (updatedData: any) => Promise<void>;
  isLoading?: boolean;
  editingSection?: string | null; // Add this
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profileData,
  onUpdateSuccess,
  isLoading: externalLoading,
  editingSection,
}: EditProfileDialogProps) {
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation(); // Changed mutation

  const [editData, setEditData] = useState<UserProfile>({
    id: profileData.id,
    name: profileData.name || "",
    gender: profileData.gender || "male",
    city: profileData.city || "",
    country: profileData.country || "",
    phone: profileData.phone || "",
    postalCode: profileData.postalCode || "",
    department: profileData.department || "",
    dateOfBirth: profileData.dateOfBirth
      ? typeof profileData.dateOfBirth === "string"
        ? profileData.dateOfBirth.split("T")[0] // Format YYYY-MM-DD for input
        : new Date(profileData.dateOfBirth).toISOString().split("T")[0]
      : "",
    maritalStatus: profileData.maritalStatus || "",
    bloodGroup: profileData.bloodGroup || "",
    cnic: profileData.cnic || "",
    projects: profileData.projects || [],
    positions: profileData.positions || [],
  });

  const [newProject, setNewProject] = useState<string>("");
  const [newPosition, setNewPosition] = useState<string>("");

  // Update editData when profileData changes
  useEffect(() => {
    setEditData({
      id: profileData.id,
      name: profileData.name || "",
      gender: profileData.gender || "male",
      city: profileData.city || "",
      country: profileData.country || "",
      phone: profileData.phone || "",
      postalCode: profileData.postalCode || "",
      department: profileData.department || "",
      dateOfBirth: profileData.dateOfBirth
        ? typeof profileData.dateOfBirth === "string"
          ? profileData.dateOfBirth.split("T")[0]
          : new Date(profileData.dateOfBirth).toISOString().split("T")[0]
        : "",
      maritalStatus: profileData.maritalStatus || "",
      bloodGroup: profileData.bloodGroup || "",
      cnic: profileData.cnic || "",
      projects: profileData.projects || [],
      positions: profileData.positions || [],
    });
  }, [profileData]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addProject = () => {
    if (newProject.trim() && !editData.projects?.includes(newProject.trim())) {
      setEditData((prev) => ({
        ...prev,
        projects: [...(prev.projects || []), newProject.trim()],
      }));
      setNewProject("");
    }
  };

  const removeProject = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || [],
    }));
  };

  const addPosition = () => {
    if (
      newPosition.trim() &&
      !editData.positions?.includes(newPosition.trim())
    ) {
      setEditData((prev) => ({
        ...prev,
        positions: [...(prev.positions || []), newPosition.trim()],
      }));
      setNewPosition("");
    }
  };

  const removePosition = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      positions: prev.positions?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSaveProfile = async () => {
    if (!editData.id) {
      alert("User ID is required");
      return;
    }

    try {
      // Prepare data for API
      const updateData: any = {};

      // Copy all fields that have values
      Object.entries(editData).forEach(([key, value]) => {
        // Skip the id field
        if (key === "id") return;

        if (Array.isArray(value)) {
          // For arrays, include even if empty
          updateData[key] = value;
        } else if (value !== undefined && value !== null && value !== "") {
          updateData[key] = value;
        }
      });

      console.log("Sending update data:", {
        id: editData.id,
        data: updateData,
      });

      // Call the update mutation
      const result = await updateUser({
        id: editData.id,
        data: updateData,
      }).unwrap();

      console.log("Update successful:", result);

      // Call the success callback if provided
      if (onUpdateSuccess) {
        await onUpdateSuccess(result);
      }

      // Close the dialog
      onOpenChange(false);
    } catch (error: any) {
      console.error("Update failed:", error);
      alert(
        error?.data?.message ||
          error?.message ||
          "Failed to update user profile"
      );
    }
  };

  useEffect(() => {
    if (open && editingSection) {
      setTimeout(() => {
        const sectionId = editingSection + "-section";
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          element.classList.add("ring-2", "ring-[rgb(96,57,187)]");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-[rgb(96,57,187)]");
          }, 2000);
        }
      }, 300);
    }
  }, [open, editingSection]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl scrollbar-hide">
        {/* Dialog Header with Gradient */}
        <div className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] text-white p-8 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-white">
              {editingSection
                ? `Edit ${
                    editingSection.charAt(0).toUpperCase() +
                    editingSection.slice(1)
                  } Information`
                : "Edit User Profile"}
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              {profileData.id
                ? `Updating user ID: ${profileData.id}`
                : "Update user information"}
            </DialogDescription>
          </DialogHeader>
        </div>
        {/* Content Area */}
        <div className="p-8 space-y-8 bg-white">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <User className="h-5 w-5 text-[rgb(96,57,187)]" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    placeholder="Enter full name"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="gender"
                  className="text-sm font-medium text-gray-700"
                >
                  Gender
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="gender"
                    name="gender"
                    value={editData.gender}
                    onChange={handleEditChange}
                    className="w-full pl-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all text-base"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="department"
                  className="text-sm font-medium text-gray-700"
                >
                  Department
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="department"
                    name="department"
                    value={editData.department}
                    onChange={handleEditChange}
                    placeholder="e.g., Engineering, Marketing"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="dateOfBirth"
                  className="text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={(editData.dateOfBirth as string) || ""}
                    onChange={handleEditChange}
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="maritalStatus"
                  className="text-sm font-medium text-gray-700"
                >
                  Marital Status
                </Label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="maritalStatus"
                    name="maritalStatus"
                    value={editData.maritalStatus}
                    onChange={handleEditChange}
                    placeholder="e.g., Single, Married"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="bloodGroup"
                  className="text-sm font-medium text-gray-700"
                >
                  Blood Group
                </Label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="bloodGroup"
                    name="bloodGroup"
                    value={editData.bloodGroup}
                    onChange={handleEditChange}
                    placeholder="e.g., A+, B-, O+"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="cnic"
                  className="text-sm font-medium text-gray-700"
                >
                  CNIC
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="cnic"
                    name="cnic"
                    value={editData.cnic}
                    onChange={handleEditChange}
                    placeholder="XXXXX-XXXXXXX-X"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Contact Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Phone className="h-5 w-5 text-[rgb(96,57,187)]" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    placeholder="Enter phone number"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-gray-700"
                >
                  City
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="city"
                    name="city"
                    value={editData.city}
                    onChange={handleEditChange}
                    placeholder="Enter city"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-700"
                >
                  Country
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="country"
                    name="country"
                    value={editData.country}
                    onChange={handleEditChange}
                    placeholder="Enter country"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="postalCode"
                  className="text-sm font-medium text-gray-700"
                >
                  Postal Code
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={editData.postalCode}
                    onChange={handleEditChange}
                    placeholder="Enter postal code"
                    className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Projects Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-[rgb(96,57,187)]" />
              Projects
            </h3>

            <div className="flex flex-wrap gap-3 mb-4">
              {editData.projects?.map((project, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="pl-4 pr-2 py-2 flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <FolderKanban className="h-3 w-3" />
                  {project}
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <FolderKanban className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addProject())
                  }
                  placeholder="Add a project"
                  className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                />
              </div>
              <Button
                type="button"
                onClick={addProject}
                variant="outline"
                size="lg"
                className="rounded-xl border-2 border-gray-200 hover:border-[rgb(96,57,187)] hover:bg-[rgb(96,57,187)]/5 hover:text-[rgb(96,57,187)] transition-all"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Positions Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-[rgb(96,57,187)]" />
              Positions
            </h3>

            <div className="flex flex-wrap gap-3 mb-4">
              {editData.positions?.map((position, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="pl-4 pr-2 py-2 flex items-center gap-2 rounded-full bg-[rgb(96,57,187)] hover:bg-[rgb(86,47,177)] transition-colors"
                >
                  <Award className="h-3 w-3" />
                  {position}
                  <button
                    type="button"
                    onClick={() => removePosition(index)}
                    className="ml-1 hover:bg-[rgb(86,47,177)] rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addPosition())
                  }
                  placeholder="Add a position"
                  className="pl-10 py-6 rounded-xl border-2 border-gray-200 focus:border-[rgb(96,57,187)] focus:ring-2 focus:ring-[rgb(96,57,187)]/20 transition-all"
                />
              </div>
              <Button
                type="button"
                onClick={addPosition}
                variant="outline"
                size="lg"
                className="rounded-xl border-2 border-gray-200 hover:border-[rgb(96,57,187)] hover:bg-[rgb(96,57,187)]/5 hover:text-[rgb(96,57,187)] transition-all"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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
            onClick={handleSaveProfile}
            disabled={isUpdating || externalLoading}
            className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] hover:from-[rgb(86,47,177)] hover:to-[rgb(110,70,190)] rounded-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            {isUpdating || externalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
