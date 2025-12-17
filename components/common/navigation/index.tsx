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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  selectCurrentUser,
  selectAccessToken,
  setUser,
} from "@/redux/slices/authSlice";
import { useGetProfileQuery } from "@/redux/services/authApi";
import { LogOut, UserCircle } from "lucide-react";

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

  // Fetch actual user from backend
  const { data, error } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (data) dispatch(setUser(data));
    if (error) {
      // Optional: handle error or logout
      // You can call onLogout() if token invalid
    }
  }, [data, error, dispatch]);

  // Set page title based on pathname
  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    setPageTitle(
      parts.length
        ? parts[parts.length - 1][0].toUpperCase() +
            parts[parts.length - 1].slice(1)
        : "Home"
    );
  }, [pathname]);

  // Get initials for avatar fallback
  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "U";

  return (
    <nav className="w-full">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900">{pageTitle}</h1>

        {/* User info + dropdown */}
        {token && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-2 rounded-full hover:bg-gray-100"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-indigo-600 text-white font-medium">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
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
  );
}
