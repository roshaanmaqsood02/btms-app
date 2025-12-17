"use client";

import React, { useState, useRef } from "react";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/redux/services/authApi";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  setCredentials,
  setError,
  clearError,
  selectAuthError,
} from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, X, Plus, AlertCircle, Camera, Upload } from "lucide-react";
import Logo from "@/public/icons/brackets_logo.svg";
import Illustrator from "@/public/images/illustrator.svg";
import { useProfilePicture } from "@/hooks/useProfilePicture";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authError = useAppSelector(selectAuthError);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLogin, setIsLogin] = useState<boolean>(true);
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
  });

  // Profile picture preview
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Temporary state for adding projects and positions
  const [newProject, setNewProject] = useState<string>("");
  const [newPosition, setNewPosition] = useState<string>("");

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const {
    uploadProfilePicture,
    isLoading: isUploadingPic,
    error: uploadError,
  } = useProfilePicture();

  const isLoading = isLoginLoading || isRegisterLoading || isUploadingPic;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    dispatch(clearError());
  };

  // Handle profile picture selection
  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        dispatch(setError("Please select a valid image file"));
        return;
      }

      // Validate file size (e.g., 5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        dispatch(setError("Image size should be less than 5MB"));
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      dispatch(clearError());
    }
  };

  // Remove profile picture
  const removeProfilePicture = () => {
    setSelectedFile(null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      if (isLogin) {
        const result = await login({
          email: formData.email,
          password: formData.password,
        }).unwrap();

        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.accessToken,
          })
        );

        router.push("/profile");
      } else {
        // Validate required fields for registration
        if (!formData.name.trim()) {
          dispatch(setError("Name is required"));
          return;
        }

        const result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          gender: formData.gender,
          city: formData.city,
          country: formData.country,
          phone: formData.phone,
          postalCode: formData.postalCode,
          department: formData.department,
          projects:
            formData.projects.length > 0 ? formData.projects : undefined,
          positions:
            formData.positions.length > 0 ? formData.positions : undefined,
        }).unwrap();

        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.accessToken,
          })
        );

        // Upload profile picture if selected
        if (selectedFile) {
          const uploadResult = await uploadProfilePicture(selectedFile);
          if (!uploadResult.success) {
            // Profile created but picture upload failed
            console.error("Profile picture upload failed:", uploadResult.error);
            // Still redirect to profile, user can upload later
          }
        }

        router.push("/profile");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "An error occurred";
      dispatch(setError(errorMessage));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    dispatch(clearError());
    // Reset form when switching modes
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
    });
    setNewProject("");
    setNewPosition("");
    removeProfilePicture();
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column - Brand Section */}
      <div className="bg-[rgb(96,57,187)] hidden lg:flex flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md space-y-8 text-center">
          <div>
            <p className="text-[rgb(25,201,209)] text-2xl md:text-3xl font-semibold mt-6">
              Simple, Robust. <br />
              Efficient, Secure.
            </p>
          </div>

          <div className="relative w-full h-64 md:h-96 mt-8">
            <Image
              src={Illustrator}
              alt="Platform Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Column - Login/Register Form */}
      <div className="bg-white flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32 md:w-52 md:h-52">
                <Image src={Logo} alt="Logo" fill className="object-contain" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-semibold tracking-tight">
              {isLogin ? "Login" : "Create Account"}
            </h2>

            {/* Error Alert */}
            {(authError || uploadError) && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription></AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!isLogin && (
                  <>
                    {/* Profile Picture Upload */}
                    <div className="space-y-2">
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

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="py-6 text-base rounded-xl"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="py-6 text-base rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="py-6 text-base rounded-xl"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-4 pt-4">
                    {/* Gender */}
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(96,57,187)] focus:border-transparent text-base"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g., Engineering, Marketing"
                        className="py-6 text-base rounded-xl"
                      />
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                          className="py-6 text-base rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          type="text"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="Country"
                          className="py-6 text-base rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Phone number"
                          className="py-6 text-base rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          type="text"
                          value={formData.postalCode}
                          onChange={handleChange}
                          placeholder="Postal code"
                          className="py-6 text-base rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-2">
                      <Label>Projects</Label>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-gray-200 rounded-xl">
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
                          <span className="text-sm text-gray-400">
                            No projects added
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newProject}
                          onChange={(e) => setNewProject(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addProject();
                            }
                          }}
                          placeholder="Add a project"
                          className="rounded-xl"
                        />
                        <Button
                          type="button"
                          onClick={addProject}
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Positions */}
                    <div className="space-y-2">
                      <Label>Positions</Label>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border border-gray-200 rounded-xl">
                        {formData.positions.length > 0 ? (
                          formData.positions.map((position, index) => (
                            <Badge
                              key={index}
                              variant="default"
                              className="pl-3 pr-1 py-1 flex items-center gap-1"
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
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addPosition();
                            }
                          }}
                          placeholder="Add a position"
                          className="rounded-xl"
                        />
                        <Button
                          type="button"
                          onClick={addPosition}
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle between Login/Register */}
              <div className="text-center pt-2">
                <Button
                  type="button"
                  variant="link"
                  onClick={toggleMode}
                  className="text-gray-600 hover:text-gray-900 text-base"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl px-8 py-6 text-lg font-medium bg-[rgb(96,57,187)] text-white hover:bg-[rgb(86,47,177)]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isUploadingPic
                        ? "Uploading Picture..."
                        : "Processing..."}
                    </>
                  ) : isLogin ? (
                    "Login"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
