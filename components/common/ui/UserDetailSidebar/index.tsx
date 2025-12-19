"use client";

import { useAppSelector } from "@/redux/hook";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Edit2, Trash2, User, Mail, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserDetailSidebarProps {
  selectedUserId: string | null;
  selectedUserData?: any; // Add this to receive the selected user's data
  onClose: () => void; // Add close handler
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserDetailSidebar({
  selectedUserId,
  selectedUserData,
  onClose,
  onEdit,
  onDelete,
}: UserDetailSidebarProps) {
  const user = useAppSelector(selectCurrentUser);

  // Only show sidebar for HRM and Operation Manager
  if (
    !user ||
    !(user.systemRole === "HRM" || user.systemRole === "OPERATION_MANAGER")
  ) {
    return null;
  }

  // If no user is selected, do not show actions
  if (!selectedUserId || !selectedUserData) return null;

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

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-lg border-l border-gray-200 z-40 overflow-y-auto">
      {/* Header with Close Button */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">User Details</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-gray-100">
            {selectedUserData?.profilePic && (
              <AvatarImage
                src={getProfilePicUrl(selectedUserData)}
                alt={selectedUserData?.name || "User"}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
              {getInitials(selectedUserData?.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h4 className="text-xl font-bold text-gray-900">
              {selectedUserData.name || "No Name"}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {selectedUserData.email || "No Email"}
            </p>
          </div>

          {/* Employee IDs */}
          <div className="flex gap-4">
            {selectedUserData.employeeId && (
              <div className="text-center">
                <p className="text-xs text-gray-500">EMP ID</p>
                <p className="text-sm font-medium">
                  {selectedUserData.employeeId}
                </p>
              </div>
            )}
            {selectedUserData.attendanceId && (
              <div className="text-center">
                <p className="text-xs text-gray-500">ATT ID</p>
                <p className="text-sm font-medium">
                  {selectedUserData.attendanceId}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="space-y-4">
          {/* Department */}
          {selectedUserData.department && (
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{selectedUserData.department}</p>
              </div>
            </div>
          )}

          {/* Gender */}
          {selectedUserData.gender && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">
                  {selectedUserData.gender}
                </p>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {selectedUserData.phone && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedUserData.phone}</p>
              </div>
            </div>
          )}

          {/* Projects */}
          {selectedUserData.projects &&
            selectedUserData.projects.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Projects</p>
                <div className="flex flex-wrap gap-1">
                  {selectedUserData.projects.map(
                    (project: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs font-normal bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {project}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Positions */}
          {selectedUserData.positions &&
            selectedUserData.positions.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Positions</p>
                <div className="flex flex-wrap gap-1">
                  {selectedUserData.positions.map(
                    (position: string, index: number) => (
                      <Badge
                        key={index}
                        className="text-xs font-normal bg-cyan-50 text-cyan-700 border-cyan-200"
                      >
                        {position}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Admin Actions */}
        <div className="pt-6 border-t border-gray-200 space-y-3">
          <h4 className="font-semibold text-gray-900">Admin Actions</h4>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-gray-300 hover:border-[#6543AA] hover:bg-[#6543AA]/5 hover:text-[#6543AA] transition-all"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
            Edit User
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-gray-300 hover:border-[#DA064D] hover:bg-[#DA064D]/5 hover:text-[#DA064D] transition-all"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}
