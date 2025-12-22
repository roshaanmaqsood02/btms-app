"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import {
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/redux/slices/authSlice";
import { useGetUserByIdQuery } from "@/redux/services/userApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  User,
  MapPin,
  Phone,
  Briefcase,
  FolderKanban,
  Award,
  Edit,
  Trash2,
  Calendar,
  Hash,
  Heart,
  Droplet,
  CreditCard,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { LoadingState } from "@/components/common/loadingState";
import { NoProfileStates } from "@/components/pages/Profile/components/NoProfileState";
import { ProfilePictureUploader } from "@/components/pages/Profile/components/ProfilePictureUpload";
import { DeleteAccountDialog } from "@/components/pages/Profile/components/DeleteAccountDialog";
import { EditProfileDialog } from "@/components/pages/Profile/components/EditProfileDetails";
import { toast } from "sonner";
import { useDeleteUserMutation } from "@/redux/services/userApi";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const userId = params.id as string;
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [deleteUserMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  // Fetch user data by ID
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch,
  } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });

  // Check if current user has permission to view this profile
  const hasPermissionToView = () => {
    if (!currentUser) return false;

    // Users can view their own profile
    if (currentUser.id?.toString() === userId) return true; // FIX: Convert to string for comparison

    // HRM and Operation Managers can view any profile
    return (
      currentUser.systemRole === "HRM" ||
      currentUser.systemRole === "OPERATION_MANAGER"
    );
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check permission after currentUser is loaded
    if (currentUser && !hasPermissionToView()) {
      toast.error("Access Denied", {
        description: "You don't have permission to view this profile",
      });
      router.push("/users");
      return;
    }

    if (profileError) {
      toast.error("Failed to load user profile", {
        description: "User not found or you don't have permission",
      });
      router.push("/users");
    }
  }, [isAuthenticated, currentUser, userId, profileError, router]);

  const handleUpdateSuccess = async (updatedData: any) => {
    await refetch();
    setIsEditOpen(false);
    setEditingSection(null);
    toast.success("Profile updated successfully");
  };

  const handleDeleteSuccess = async () => {
    try {
      await deleteUserMutation(userId).unwrap();

      toast.success("User deleted successfully", {
        description: "The user has been removed from the system",
      });

      // If admin is deleting their own account, logout
      if (currentUser?.id?.toString() === userId) {
        // FIX: Convert to string
        dispatch(logout());
        router.push("/");
      } else {
        // Otherwise go back to users list
        router.push("/users");
      }
    } catch (error: any) {
      toast.error("Failed to delete user", {
        description: error?.data?.message || "Please try again later",
      });
    }
  };

  const handleEditSection = (section: string) => {
    setEditingSection(section);
    setIsEditOpen(true);
  };

  // Check if current user can edit this profile
  const canEditProfile = () => {
    if (!currentUser || !profileData) return false;

    // HRM and Operation Managers can edit any profile
    return (
      currentUser.systemRole === "HRM" ||
      currentUser.systemRole === "OPERATION_MANAGER"
    );
  };

  // Check if current user can delete this profile
  const canDeleteProfile = () => {
    if (!currentUser) return false;

    // Only HRM can delete users (can't delete their own account from here)
    return (
      currentUser.systemRole === "HRM" && currentUser.id?.toString() !== userId
    ); // FIX: Convert to string
  };

  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (isProfileLoading) {
    return <LoadingState />;
  }

  if (!profileData) {
    return <NoProfileStates />;
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/users")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        {/* Profile Header Card */}
        <Card className="shadow-xl border-0 mb-8 overflow-hidden p-0">
          <CardHeader className="bg-gradient-to-r from-[rgb(96,57,187)] to-[rgb(120,80,200)] text-white p-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

            <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <ProfilePictureUploader
                    size="lg"
                    userId={userId}
                    profileData={profileData} // Pass the profile data
                    onUploadSuccess={() => {
                      refetch();
                      toast.success("Profile picture updated successfully");
                    }}
                    canEdit={canEditProfile()}
                  />
                </div>
                <div className="text-center md:text-left">
                  <CardTitle className="text-3xl font-bold mb-2">
                    {profileData.name}
                    {currentUser?.id?.toString() === userId && ( // FIX: Convert to string
                      <span className="ml-3 text-sm font-normal bg-white/20 px-2 py-1 rounded">
                        (You)
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    {profileData.email}
                  </CardDescription>
                  {profileData.department && (
                    <Badge
                      variant="secondary"
                      className="mt-3 text-sm px-3 py-1"
                    >
                      <Briefcase className="h-3 w-3 mr-1" />
                      {profileData.department}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                {canDeleteProfile() && (
                  <Button
                    onClick={() => setIsDeleteOpen(true)}
                    variant="destructive"
                    className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    size="lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Personal Information Section */}
            <div className="mb-8 relative group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-[rgb(96,57,187)]" />
                  Personal Information
                </h3>
                {canEditProfile() && (
                  <Button
                    onClick={() => handleEditSection("personal")}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgb(96,57,187)]/10 hover:text-[rgb(96,57,187)]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard
                  icon={<Hash className="h-5 w-5" />}
                  label="Attendance ID"
                  value={profileData.attendanceId || "Not specified"}
                  color="blue"
                />
                <InfoCard
                  icon={<Hash className="h-5 w-5" />}
                  label="Employee ID"
                  value={profileData.employeeId || "Not specified"}
                  color="blue"
                />
                <InfoCard
                  icon={<User className="h-5 w-5" />}
                  label="Gender"
                  value={
                    profileData.gender
                      ? profileData.gender.charAt(0).toUpperCase() +
                        profileData.gender.slice(1)
                      : "Not specified"
                  }
                  color="purple"
                />
                <InfoCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Date of Birth"
                  value={formatDate(profileData.dateOfBirth)} // FIX: Use safe date formatter
                  color="green"
                />
                <InfoCard
                  icon={<Heart className="h-5 w-5" />}
                  label="Marital Status"
                  value={profileData.maritalStatus || "Not specified"}
                  color="pink"
                />
                <InfoCard
                  icon={<Droplet className="h-5 w-5" />}
                  label="Blood Group"
                  value={profileData.bloodGroup || "Not specified"}
                  color="red"
                />
                <InfoCard
                  icon={<CreditCard className="h-5 w-5" />}
                  label="CNIC"
                  value={profileData.cnic || "Not specified"}
                  color="indigo"
                />
              </div>
            </div>

            <Separator className="my-8" />

            {/* Contact Information Section */}
            <div className="mb-8 relative group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[rgb(96,57,187)]" />
                  Contact Information
                </h3>
                {canEditProfile() && (
                  <Button
                    onClick={() => handleEditSection("contact")}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgb(96,57,187)]/10 hover:text-[rgb(96,57,187)]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone Number"
                  value={profileData.phone || "Not specified"}
                  color="blue"
                />
                <InfoCard
                  icon={<MapPin className="h-5 w-5" />}
                  label="City"
                  value={profileData.city || "Not specified"}
                  color="green"
                />
                <InfoCard
                  icon={<MapPin className="h-5 w-5" />}
                  label="Country"
                  value={profileData.country || "Not specified"}
                  color="purple"
                />
                <InfoCard
                  icon={<MapPin className="h-5 w-5" />}
                  label="Postal Code"
                  value={profileData.postalCode || "Not specified"}
                  color="orange"
                />
              </div>
            </div>

            <Separator className="my-8" />

            {/* Projects and Positions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Projects Section */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-[rgb(96,57,187)]" />
                    Projects
                  </h3>
                  {canEditProfile() && (
                    <Button
                      onClick={() => handleEditSection("projects")}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgb(96,57,187)]/10 hover:text-[rgb(96,57,187)]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.projects && profileData.projects.length > 0 ? (
                    profileData.projects.map(
                      (project: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          {project}
                        </Badge>
                      )
                    )
                  ) : (
                    <div className="text-gray-500 text-sm bg-gray-100 px-4 py-3 rounded-lg w-full text-center">
                      No projects assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Positions Section */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Award className="h-5 w-5 text-[rgb(96,57,187)]" />
                    Positions
                  </h3>
                  {canEditProfile() && (
                    <Button
                      onClick={() => handleEditSection("positions")}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgb(96,57,187)]/10 hover:text-[rgb(96,57,187)]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.positions && profileData.positions.length > 0 ? (
                    profileData.positions.map(
                      (position: string, index: number) => (
                        <Badge
                          key={index}
                          className="text-sm px-4 py-2 rounded-full bg-[rgb(96,57,187)] hover:bg-[rgb(86,47,177)] transition-colors"
                        >
                          {position}
                        </Badge>
                      )
                    )
                  ) : (
                    <div className="text-gray-500 text-sm bg-gray-100 px-4 py-3 rounded-lg w-full text-center">
                      No positions assigned
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        {canEditProfile() && (
          <EditProfileDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            profileData={profileData}
            onUpdateSuccess={handleUpdateSuccess}
            editingSection={editingSection}
          />
        )}

        {/* Delete Account Dialog */}
        <DeleteAccountDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onDeleteSuccess={handleDeleteSuccess}
          isDeleting={isDeleting}
          userName={profileData.name}
          isSelfDelete={currentUser?.id?.toString() === userId} // FIX: Convert to string
        />
      </main>
    </div>
  );
}

// Info Card Component
function InfoCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-green-50 text-green-700 border-green-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
    red: "bg-red-50 text-red-700 border-red-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
      } transition-all hover:shadow-md`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="opacity-70">{icon}</div>
        <span className="text-sm font-medium opacity-80">{label}</span>
      </div>
      <p className="text-lg font-semibold pl-8">{value}</p>
    </div>
  );
}
