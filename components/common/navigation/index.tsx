"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  selectCurrentUser,
  selectAccessToken,
  setUser,
} from "@/redux/slices/authSlice";
import { useGetProfileQuery } from "@/redux/services/authApi";
import { LogOut, UserCircle, Key } from "lucide-react";
import { ChangePasswordDialog } from "@/components/auth/ChangePassword";

interface NavigationProps {
  onLogout: () => void;
}

export function Navigation({ onLogout }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const token = useAppSelector(selectAccessToken);
  const user = useAppSelector(selectCurrentUser);

  const [pageTitle, setPageTitle] = useState<string>("Home");
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const { data, error, refetch } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (data) dispatch(setUser(data));
    if (error) {
      // Optional: handle error or logout
    }
  }, [data, error, dispatch]);

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    setPageTitle(
      parts.length
        ? parts[parts.length - 1][0].toUpperCase() +
            parts[parts.length - 1].slice(1)
        : "Home"
    );
  }, [pathname]);

  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U";

  const getProfilePicUrl = () => {
    if (!user?.profilePic) return "";

    if (user.profilePic.startsWith("http")) {
      return `${user.profilePic}?v=${Date.now()}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return `${baseUrl}/${user.profilePic.replace(/^\/+/, "")}?v=${Date.now()}`;
  };

  const handlePasswordChangeSuccess = () => {
    refetch();
    setChangePasswordOpen(false);
  };

  return (
    <>
      <nav className="w-full">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">{pageTitle}</h1>

          {token && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 px-2 rounded-full hover:bg-gray-100"
                >
                  <Avatar className="h-9 w-9">
                    {user?.profilePic && (
                      <AvatarImage
                        src={getProfilePicUrl()}
                        alt={user?.name || "User"}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-indigo-600 text-white font-medium">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.systemRole}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setChangePasswordOpen(true)}
                  className="cursor-pointer"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onPasswordChangeSuccess={handlePasswordChangeSuccess}
      />
    </>
  );
}
