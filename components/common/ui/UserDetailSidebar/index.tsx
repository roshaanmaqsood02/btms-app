"use client";

import { useAppSelector } from "@/redux/hook";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  X,
  Edit2,
  Trash2,
  User,
  Mail,
  Briefcase,
  Hash,
  Shield,
  Building,
  BadgeCheck,
  PhoneCall,
} from "lucide-react";

interface UserDetailSidebarProps {
  selectedUserId: string | null;
  selectedUserData?: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export default function UserDetailSidebar({
  selectedUserId,
  selectedUserData,
  onClose,
  onEdit,
  onDelete,
  isLoading = false,
}: UserDetailSidebarProps) {
  const currentUser = useAppSelector(selectCurrentUser);

  // If no user is selected, don't render
  if (!selectedUserId) return null;

  // Get initials for avatar
  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U";

  // Construct profile picture URL
  const getProfilePicUrl = (user: any) => {
    if (!user?.profilePic) return "";
    if (user.profilePic.startsWith("http")) {
      return `${user.profilePic}?v=${Date.now()}`;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${baseUrl}/${user.profilePic.replace(/^\/+/, "")}?v=${Date.now()}`;
  };

  const profilePicUrl = selectedUserData?.profilePic
    ? getProfilePicUrl(selectedUserData)
    : "";
  const initials = getInitials(selectedUserData?.name);

  // Check if current user has admin privileges
  const hasAdminAccess =
    currentUser?.systemRole === "HRM" ||
    currentUser?.systemRole === "OPERATION_MANAGER";

  const canDelete = currentUser?.systemRole === "HRM";
  const canEdit = hasAdminAccess;

  return (
    <Sheet open={!!selectedUserId} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 border-l border-gray-200/50 overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-bold text-gray-900">
                User Details
              </SheetTitle>
              <SheetDescription>
                View and manage user information
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-6 space-y-6">
            {/* Profile Card */}
            <Card className="border-gray-200/50 shadow-sm overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-white shadow-lg ring-2 ring-gray-100">
                      {!isLoading && profilePicUrl ? (
                        <AvatarImage
                          src={profilePicUrl}
                          alt={selectedUserData?.name || "User"}
                          className="object-cover"
                        />
                      ) : (
                        <Skeleton className="h-28 w-28 rounded-full" />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-3xl font-bold">
                        {isLoading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          initials
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* User Info */}
                  <div className="text-center space-y-2">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-4 w-32 mx-auto" />
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {selectedUserData?.name || "No Name"}
                        </h3>
                        <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedUserData?.email || "No email"}
                        </p>
                      </>
                    )}

                    {/* Employee IDs */}
                    {(selectedUserData?.employeeId ||
                      selectedUserData?.attendanceId) && (
                      <div className="flex gap-3 justify-center pt-2">
                        {selectedUserData.employeeId && (
                          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              EMP ID
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedUserData.employeeId}
                            </p>
                          </div>
                        )}
                        {selectedUserData.attendanceId && (
                          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <BadgeCheck className="h-3 w-3" />
                              ATT ID
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedUserData.attendanceId}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-gray-200/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Department */}
                {selectedUserData?.department && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">
                        {selectedUserData.department}
                      </p>
                    </div>
                  </div>
                )}

                {/* System Role */}
                {selectedUserData?.systemRole && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                    <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">System Role</p>
                      <Badge
                        variant="outline"
                        className="mt-1 bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {selectedUserData.systemRole.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {selectedUserData?.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                    <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <PhoneCall className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedUserData.phone}</p>
                    </div>
                  </div>
                )}

                {/* Gender */}
                {selectedUserData?.gender && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/50">
                    <div className="h-9 w-9 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-pink-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">
                        {selectedUserData.gender}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects & Positions */}
            {(selectedUserData?.projects?.length > 0 ||
              selectedUserData?.positions?.length > 0) && (
              <Card className="border-gray-200/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-500" />
                    Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Projects */}
                  {selectedUserData?.projects?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Projects
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUserData.projects.map(
                          (project: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border-green-200"
                            >
                              {project}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Positions */}
                  {selectedUserData?.positions?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Positions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUserData.positions.map(
                          (position: string, index: number) => (
                            <Badge
                              key={index}
                              className="px-3 py-1.5 text-xs font-medium bg-cyan-50 text-cyan-700 border-cyan-200"
                            >
                              {position}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Admin Actions - Show only for authorized users */}
            {hasAdminAccess && (
              <Card className="border-gray-200/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-500" />
                    Admin Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Edit Button - Show for HRM and Operation Manager */}
                  {canEdit && (
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start gap-3 border-gray-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
                      onClick={onEdit}
                      disabled={isLoading}
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Edit User Profile</span>
                    </Button>
                  )}

                  {/* Delete Button - Show ONLY for HRM */}
                  {canDelete && (
                    <>
                      <Separator />
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start gap-3 border-gray-200 hover:border-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
                        onClick={onDelete}
                        disabled={isLoading}
                      >
                        <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="font-medium">Delete User Account</span>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-200/50">
              <p>User ID: {selectedUserId}</p>
              {selectedUserData?.updatedAt && (
                <p className="mt-1">
                  Last updated:{" "}
                  {new Date(selectedUserData.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
