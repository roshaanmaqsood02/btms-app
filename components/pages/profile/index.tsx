"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import {
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
  Lock,
  GraduationCap,
  Laptop,
} from "lucide-react";
import { LoadingState } from "@/components/common/loadingState";
import { NoProfileStates } from "@/components/pages/Profile/components/NoProfileState";
import { ProfilePictureUploader } from "@/components/pages/Profile/components/ProfilePictureUpload";
import { EditProfileDialog } from "@/components/pages/Profile/components/EditProfileDetails";
import { toast } from "sonner";
import DeleteUserDialog from "../User/DeleteUser";
import ContractInfo from "./ContractInfo";
import EducationInfo from "./EducationInfo";
import AssetsInfo from "./AssetInfo";

interface ProfileProps {
  usersId: string;
}

export default function Profile({ usersId }: ProfileProps) {
  const router = useRouter();
  const userId = usersId;
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
    systemRole?: string;
  } | null>(null);

  // Fetch user data by ID
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch,
  } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });

  // Check if current user has permission to view this profile - return boolean
  const hasPermissionToView = useMemo(() => {
    if (!currentUser) return false;

    // Users can view their own profile
    if (currentUser.id?.toString() === userId) return true;

    // HRM, Operation Managers and Project Managers can view any profile
    return (
      currentUser.systemRole === "HRM" ||
      currentUser.systemRole === "OPERATION_MANAGER" ||
      currentUser.systemRole === "PROJECT_MANAGER" ||
      currentUser.systemRole === "ADMIN"
    );
  }, [currentUser, userId]);

  // Check if current user can edit this profile
  const canEditProfile = useMemo(() => {
    if (!currentUser || !profileData) return false;

    const currentUserId = currentUser.id?.toString();
    const targetUserId = profileData.id?.toString();

    // Users can edit their own profile
    if (currentUserId === targetUserId) return true;

    // ADMIN can edit any profile
    if (currentUser.systemRole === "ADMIN") return true;

    // HRM and Operation Managers can edit certain profiles
    if (
      currentUser.systemRole === "HRM" ||
      currentUser.systemRole === "OPERATION_MANAGER"
    ) {
      const targetUserRole = profileData.systemRole;

      if (currentUser.systemRole === "HRM") {
        // HRM cannot edit ADMIN, other HRM, or Operation Managers
        return !(
          targetUserRole === "ADMIN" ||
          targetUserRole === "HRM" ||
          targetUserRole === "OPERATION_MANAGER"
        );
      }

      if (currentUser.systemRole === "OPERATION_MANAGER") {
        // Operation Manager cannot edit ADMIN, HRM, or other Operation Managers
        return !(
          targetUserRole === "ADMIN" ||
          targetUserRole === "HRM" ||
          targetUserRole === "OPERATION_MANAGER"
        );
      }
    }

    return false;
  }, [currentUser, profileData]);

  // Check if current user can view contract section
  const canViewContractSection = useMemo(() => {
    if (!currentUser) return false;

    // PROJECT_MANAGER cannot view contract section
    if (currentUser.systemRole === "PROJECT_MANAGER") return false;

    // Other roles can view contract section
    return (
      currentUser.systemRole === "ADMIN" ||
      currentUser.systemRole === "HRM" ||
      currentUser.systemRole === "OPERATION_MANAGER"
    );
  }, [currentUser]);

  // Check if current user can delete this profile
  const canDeleteProfile = useMemo(() => {
    if (!currentUser || !profileData) return false;

    const currentUserId = currentUser.id?.toString();
    const targetUserId = profileData.id?.toString();

    // Cannot delete yourself from profile page
    if (currentUserId === targetUserId) return false;

    // ADMIN can delete anyone
    if (currentUser.systemRole === "ADMIN") return true;

    // HRM can delete some users
    if (currentUser.systemRole === "HRM") {
      const targetUserRole = profileData.systemRole;
      // HRM cannot delete ADMIN, other HRM, or Operation Managers
      return !(
        targetUserRole === "ADMIN" ||
        targetUserRole === "HRM" ||
        targetUserRole === "OPERATION_MANAGER"
      );
    }

    return false;
  }, [currentUser, profileData, userId]);

  // Format date safely - memoize this function
  const formatDate = useCallback((dateString?: string) => {
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
  }, []);

  // Memoize the edit dialog rendering condition
  const shouldShowEditDialog = useMemo(() => {
    return canEditProfile && isEditOpen;
  }, [canEditProfile, isEditOpen]);

  // Check if current user can view education section
  const canViewEducationSection = useMemo(() => {
    if (!currentUser) return false;

    // All authenticated users can view education
    return true;
  }, [currentUser]);

  // Handle edit profile success
  const handleUpdateSuccess = useCallback(async () => {
    await refetch();
    setIsEditOpen(false);
    setEditingSection(null);
    toast.success("Profile updated successfully");
  }, [refetch]);

  // Handle delete button click
  const handleDeleteClick = useCallback(() => {
    if (!profileData) return;

    if (!canDeleteProfile) {
      let errorMessage = "You do not have permission to delete this user";

      if (
        currentUser?.systemRole === "HRM" &&
        profileData.systemRole &&
        (profileData.systemRole === "ADMIN" ||
          profileData.systemRole === "HRM" ||
          profileData.systemRole === "OPERATION_MANAGER")
      ) {
        errorMessage = "HRM cannot delete ADMIN, HRM, or Operation Managers";
      } else if (currentUser?.id?.toString() === profileData.id?.toString()) {
        errorMessage = "You cannot delete your own account from here";
      }

      toast.error("Permission Denied", {
        description: errorMessage,
      });
      return;
    }

    setUserToDelete({
      id: profileData.id.toString(),
      name: profileData.firstname + " " + profileData.lastname,
      systemRole: profileData.systemRole,
    });
    setIsDeleteDialogOpen(true);
  }, [profileData, canDeleteProfile, currentUser]);

  // Handle delete success
  const handleDeleteSuccess = useCallback(async () => {
    try {
      toast.success("User deleted successfully", {
        description: "The user has been removed from the system",
      });

      // Reset dialog state
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);

      // Go back to users list
      router.push("/users");
    } catch (error: any) {
      toast.error("Failed to delete user", {
        description: error?.data?.message || "Please try again later",
      });
    }
  }, [router]);

  const handleEditSection = useCallback((section: string) => {
    setEditingSection(section);
    setIsEditOpen(true);
  }, []);

  // Handle authentication and permission checks
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check permission after currentUser is loaded
    if (currentUser && !hasPermissionToView) {
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
  }, [
    isAuthenticated,
    currentUser,
    userId,
    profileError,
    router,
    hasPermissionToView,
  ]);

  // Early returns after all hooks
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
                    profileData={profileData}
                    onUploadSuccess={() => {
                      refetch();
                      toast.success("Profile picture updated successfully");
                    }}
                    canEdit={
                      canEditProfile || currentUser?.systemRole === "ADMIN"
                    }
                  />
                </div>
                <div className="text-center md:text-left">
                  <CardTitle className="text-3xl font-bold mb-2">
                    {profileData.firstname} {profileData.lastname}
                    {currentUser?.id?.toString() === userId && (
                      <span className="ml-3 text-sm font-normal bg-white/20 px-2 py-1 rounded">
                        (You)
                      </span>
                    )}
                    {currentUser?.systemRole === "ADMIN" &&
                      currentUser?.id?.toString() !== userId && (
                        <span className="ml-3 text-sm font-normal bg-red-500 px-2 py-1 rounded">
                          Viewing as ADMIN
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
              <div className="flex gap-2">
                {canDeleteProfile && (
                  <Button
                    onClick={handleDeleteClick}
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
                {canEditProfile && (
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
                  value={formatDate(profileData.dateOfBirth)}
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
                {canEditProfile && (
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
                  label="Province"
                  value={profileData.province || "Not specified"}
                  color="red"
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

            {/* Contract Info Section - Only show for authorized roles */}
            {canViewContractSection && (
              <>
                <Separator className="my-8" />

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-[rgb(96,57,187)]" />
                      Contract Information
                    </h3>
                  </div>

                  {/* Wrap ContractInfo in error boundary or conditional render */}
                  <div className="bg-white rounded-xl border p-6">
                    {userId ? (
                      <ContractInfo userId={userId} canEdit={canEditProfile} />
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-2">
                          No Contract Information
                        </h4>
                        <p className="text-gray-500 mb-4">
                          Contract details will be available after contract
                          creation
                        </p>
                        {canEditProfile && (
                          <Button
                            onClick={() => handleEditSection("contract")}
                            variant="outline"
                            size="sm"
                          >
                            Add Contract
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-8" />
              </>
            )}

            {/* Education Section - Always visible to authenticated users */}
            {canViewEducationSection && (
              <>
                <div className="mb-8 relative group">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-[rgb(96,57,187)]" />
                      Education Information
                    </h3>
                  </div>

                  {/* Education Info Component */}
                  <div className="bg-white rounded-xl border p-6">
                    <EducationInfo
                      userId={userId}
                      canEdit={canEditProfile}
                      onEducationUpdated={() => {
                        // This will refresh the education data when new education is added
                        refetch();
                      }}
                    />
                  </div>
                </div>

                <Separator className="my-8" />
              </>
            )}

            {/* Assets Section - Always visible to authenticated users */}
            {canViewEducationSection && (
              <>
                <div className="mb-8 relative group">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Laptop className="h-5 w-5 text-[rgb(96,57,187)]" />
                      Assets Information
                    </h3>
                    {canEditProfile && (
                      <Button
                        onClick={() => {
                          // You can open a modal or navigate to assets management page
                          toast.info(
                            "Use the + button in the assets section to add new assets"
                          );
                        }}
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgb(96,57,187)]/10 hover:text-[rgb(96,57,187)]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Assets Info Component */}
                  <div className="bg-white rounded-xl border p-6">
                    <AssetsInfo
                      userId={userId}
                      canEdit={canEditProfile}
                      onAssetUpdated={() => {
                        // This will refresh the assets data when new asset is added
                        refetch();
                      }}
                    />
                  </div>
                </div>

                <Separator className="my-8" />
              </>
            )}

            {/* Show message for PROJECT_MANAGER about restricted access */}
            {!canViewContractSection &&
              currentUser?.systemRole === "PROJECT_MANAGER" && (
                <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-semibold text-yellow-800 mb-1">
                        Restricted Access
                      </h4>
                      <p className="text-yellow-700">
                        Contract information is restricted to HRM, Operation
                        Managers, and ADMIN only. As a PROJECT_MANAGER, you can
                        view personal and project information.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Projects and Positions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Projects Section */}
              <div className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-[rgb(96,57,187)]" />
                    Projects
                  </h3>
                  {canEditProfile && (
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
                  {canEditProfile && (
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

        {/* Edit Profile Dialog - Conditionally render */}
        {shouldShowEditDialog && (
          <EditProfileDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            profileData={profileData}
            onUpdateSuccess={handleUpdateSuccess}
            editingSection={editingSection}
            userId={userId}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {userToDelete && (
          <DeleteUserDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            userToDelete={userToDelete}
            onDeleteSuccess={handleDeleteSuccess}
            currentUserRole={currentUser?.systemRole}
            currentUserId={currentUser?.id?.toString()}
          />
        )}
      </main>
    </div>
  );
}

// Info Card Component - Memoized
const InfoCard = React.memo(
  ({
    icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
  }) => {
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
);
