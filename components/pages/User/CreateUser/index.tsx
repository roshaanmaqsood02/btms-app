"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Loader2, X, Plus, Camera, Upload } from "lucide-react";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateUserModal({
  open,
  onOpenChange,
  onCreateUser,
  isLoading = false,
}: CreateUserModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    gender: "male",
    city: "",
    country: "",
    phone: "",
    postalCode: "",
    department: "",
    projects: [] as string[],
    positions: [] as string[],
    systemRole: "EMPLOYEE", // Added systemRole for admin creation
  });

  const [newProject, setNewProject] = useState<string>("");
  const [newPosition, setNewPosition] = useState<string>("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      gender: "male",
      city: "",
      country: "",
      phone: "",
      postalCode: "",
      department: "",
      projects: [],
      positions: [],
      systemRole: "EMPLOYEE",
    });
    setNewProject("");
    setNewPosition("");
    setProfilePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      alert("Name is required!");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required!");
      return;
    }

    if (!formData.password.trim()) {
      alert("Password is required!");
      return;
    }

    // Prepare user data
    const userData: any = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      gender: formData.gender,
      systemRole: formData.systemRole,
    };

    // Add optional fields if they exist
    if (formData.city.trim()) userData.city = formData.city;
    if (formData.country.trim()) userData.country = formData.country;
    if (formData.phone.trim()) userData.phone = formData.phone;
    if (formData.postalCode.trim()) userData.postalCode = formData.postalCode;
    if (formData.department.trim()) userData.department = formData.department;
    if (formData.projects.length > 0) userData.projects = formData.projects;
    if (formData.positions.length > 0) userData.positions = formData.positions;

    try {
      await onCreateUser({
        userData,
        profilePicture: selectedFile, // Send file separately
      });

      // Reset form on success
      resetForm();
    } catch (error) {
      // Error handling is done in parent component
      console.error("Error creating user:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Profile picture handling
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setSelectedFile(null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Array management functions
  const addProject = () => {
    if (newProject.trim() && !formData.projects.includes(newProject.trim())) {
      setFormData((prev) => ({
        ...prev,
        projects: [...prev.projects, newProject.trim()],
      }));
      setNewProject("");
    }
  };

  const removeProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addPosition = () => {
    if (
      newPosition.trim() &&
      !formData.positions.includes(newPosition.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        positions: [...prev.positions, newPosition.trim()],
      }));
      setNewPosition("");
    }
  };

  const removePosition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: "project" | "position"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "project") {
        addProject();
      } else {
        addPosition();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm(); // Reset form when closing
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Picture Upload */}
            <div className="space-y-2 md:col-span-2">
              <Label>Profile Picture</Label>
              <div className="flex flex-col items-center gap-4">
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

                <p className="text-xs text-gray-500 text-center">
                  Recommended: Square image, max 5MB
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                placeholder="John Doe"
                className="py-2"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
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
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                placeholder="••••••••"
                className="py-2"
              />
            </div>

            {/* System Role */}
            <div className="space-y-2">
              <Label htmlFor="systemRole">System Role *</Label>
              <Select
                value={formData.systemRole}
                onValueChange={(value) => handleChange("systemRole", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="OPERATION_MANAGER">
                    Operation Manager
                  </SelectItem>
                  <SelectItem value="HRM">HR Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
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
                value={formData.department}
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
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="City"
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
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
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Phone number"
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="Postal code"
                className="py-2"
              />
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-2">
            <Label>Projects</Label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-gray-200 rounded-md">
              {formData.projects.length > 0 ? (
                formData.projects.map((project, index) => (
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
              {formData.positions.length > 0 ? (
                formData.positions.map((position, index) => (
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
                <span className="text-sm text-gray-400">
                  No positions added
                </span>
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

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#6039BB] hover:bg-[#5029AA] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
