"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import {
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/redux/slices/authSlice";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from "@/redux/services/authApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  User,
  Mail,
  MapPin,
  Phone,
  Lock,
  AlertTriangle,
  Briefcase,
  FolderKanban,
  Award,
  X,
  Plus,
} from "lucide-react";
import { LoadingState } from "@/components/common/loadingState";
import { NoProfileStates } from "./components/NoProfileState";

export default function Profile() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get user from Redux store
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Fetch fresh profile data
  const {
    data: freshProfile,
    isLoading: isProfileLoading,
    refetch,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Update profile mutation
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  // State for edit mode and form data
  const [editData, setEditData] = useState({
    name: "",
    gender: "",
    city: "",
    country: "",
    phone: "",
    postalCode: "",
    department: "",
    projects: [] as string[],
    positions: [] as string[],
  });

  // State for adding new items
  const [newProject, setNewProject] = useState<string>("");
  const [newPosition, setNewPosition] = useState<string>("");

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Use fresh profile data or fallback to stored user data
  const profileData = freshProfile || user;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Initialize edit data when profile loads
  useEffect(() => {
    if (profileData) {
      setEditData({
        name: profileData.name || "",
        gender: profileData.gender || "male",
        city: profileData.city || "",
        country: profileData.country || "",
        phone: profileData.phone || "",
        postalCode: profileData.postalCode || "",
        department: profileData.department || "",
        projects: profileData.projects || [],
        positions: profileData.positions || [],
      });
    }
  }, [profileData]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Array management functions
  const addProject = () => {
    if (newProject.trim() && !editData.projects.includes(newProject.trim())) {
      setEditData((prev) => ({
        ...prev,
        projects: [...prev.projects, newProject.trim()],
      }));
      setNewProject("");
    }
  };

  const removeProject = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addPosition = () => {
    if (
      newPosition.trim() &&
      !editData.positions.includes(newPosition.trim())
    ) {
      setEditData((prev) => ({
        ...prev,
        positions: [...prev.positions, newPosition.trim()],
      }));
      setNewPosition("");
    }
  };

  const removePosition = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Filter out empty values except arrays
      const updateData: any = {};
      Object.entries(editData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          updateData[key] = value;
        } else if (value !== "") {
          updateData[key] = value;
        }
      });

      await updateProfile(updateData).unwrap();
      await refetch(); // Refresh profile data
      // Show success message
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Update failed:", error);
      alert(error?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long!");
      return;
    }

    try {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      alert("Password changed successfully!");
    } catch (error: any) {
      console.error("Password change failed:", error);
      alert(error?.data?.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (!passwordData.currentPassword) {
      alert("Please enter your current password to confirm account deletion");
      return;
    }

    try {
      await deleteAccount({
        password: passwordData.currentPassword,
      }).unwrap();

      alert("Account deleted successfully");
      router.push("/");
    } catch (error: any) {
      console.error("Delete failed:", error);
      alert(error?.data?.message || "Failed to delete account");
    }
  };

  // Loading state
  if (isProfileLoading) {
    return <LoadingState />;
  }

  // If no profile data
  if (!profileData) {
    return <NoProfileStates />;
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="border-0 shadow-lg p-0">
            <CardHeader className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] text-white rounded-t-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{profileData.name}</CardTitle>
                  <CardDescription className="text-white/80">
                    {profileData.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email:</span>
                  </div>
                  <p className="text-lg">{profileData.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Gender:</span>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {profileData.gender?.charAt(0).toUpperCase() +
                      profileData.gender?.slice(1)}
                  </Badge>
                </div>

                {profileData.department && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-medium">Department:</span>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {profileData.department}
                    </Badge>
                  </div>
                )}

                {profileData.city && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">City:</span>
                    </div>
                    <p className="text-lg">{profileData.city}</p>
                  </div>
                )}

                {profileData.country && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Country:</span>
                    </div>
                    <p className="text-lg">{profileData.country}</p>
                  </div>
                )}

                {profileData.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Phone:</span>
                    </div>
                    <p className="text-lg">{profileData.phone}</p>
                  </div>
                )}

                {profileData.postalCode && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Postal Code:</span>
                    </div>
                    <p className="text-lg">{profileData.postalCode}</p>
                  </div>
                )}
              </div>

              {/* Projects and Positions Section */}
              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Projects */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FolderKanban className="h-4 w-4" />
                    <span className="font-medium">Projects:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.projects && profileData.projects.length > 0 ? (
                      profileData.projects.map(
                        (project: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {project}
                          </Badge>
                        )
                      )
                    ) : (
                      <span className="text-sm text-gray-500">
                        No projects assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Positions */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Positions:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.positions &&
                    profileData.positions.length > 0 ? (
                      profileData.positions.map(
                        (position: string, index: number) => (
                          <Badge key={index} variant="default">
                            {position}
                          </Badge>
                        )
                      )
                    ) : (
                      <span className="text-sm text-gray-500">
                        No positions assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Management Tabs */}
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="edit"
                className="data-[state=active]:bg-[rgb(96,57,187)] data-[state=active]:text-white"
              >
                Edit Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-[rgb(96,57,187)] data-[state=active]:text-white"
              >
                Security
              </TabsTrigger>
            </TabsList>

            {/* Edit Profile Tab */}
            <TabsContent value="edit">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        placeholder="Enter your full name"
                        className="rounded-xl py-6"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={editData.gender}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(96,57,187)] focus:border-transparent text-base text-gray-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        value={editData.department}
                        onChange={handleEditChange}
                        placeholder="e.g., Engineering, Marketing"
                        className="rounded-xl py-6"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={editData.phone}
                        onChange={handleEditChange}
                        placeholder="Enter your phone number"
                        className="rounded-xl py-6"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={editData.city}
                        onChange={handleEditChange}
                        placeholder="Enter your city"
                        className="rounded-xl py-6"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={editData.country}
                        onChange={handleEditChange}
                        placeholder="Enter your country"
                        className="rounded-xl py-6"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={editData.postalCode}
                        onChange={handleEditChange}
                        placeholder="Enter your postal code"
                        className="rounded-xl py-6"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Projects Section */}
                  <div className="space-y-4">
                    <Label className="text-base flex items-center gap-2">
                      <FolderKanban className="h-4 w-4" />
                      Projects
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editData.projects.map((project, index) => (
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
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newProject}
                        onChange={(e) => setNewProject(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addProject())
                        }
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

                  {/* Positions Section */}
                  <div className="space-y-4">
                    <Label className="text-base flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Positions
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editData.positions.map((position, index) => (
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
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newPosition}
                        onChange={(e) => setNewPosition(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addPosition())
                        }
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
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="bg-[rgb(96,57,187)] hover:bg-[rgb(86,47,177)] rounded-xl px-8 py-6"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password here. After saving, you&apos;ll be
                    logged out.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      <Lock className="inline h-4 w-4 mr-2" />
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter current password"
                      className="rounded-xl py-6"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter new password"
                        className="rounded-xl py-6"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Confirm new password"
                        className="rounded-xl py-6"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isUpdating}
                    className="bg-[rgb(96,57,187)] hover:bg-[rgb(86,47,177)] rounded-xl px-8 py-6"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Separator className="my-8" />

              {/* Delete Account Section */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Delete Account
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </p>
                </CardContent>
                <CardFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 rounded-xl px-8 py-6"
                      >
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4 py-4">
                        <Label htmlFor="deletePassword">
                          Enter your current password to confirm:
                        </Label>
                        <Input
                          id="deletePassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          placeholder="Enter your password"
                          className="rounded-xl"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || !passwordData.currentPassword}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete Account"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
