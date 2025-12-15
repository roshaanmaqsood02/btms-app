"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hook";
import { logout } from "@/redux/slices/authSlice";
import { Navigation } from "../navigation";

export default function NavigationWrapper() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return <Navigation onLogout={handleLogout} />;
}
