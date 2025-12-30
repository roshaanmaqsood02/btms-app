// app/users/add/page.tsx
"use client";

import dynamic from "next/dynamic";

// Use dynamic import to avoid SSR issues
const AddUser = dynamic(() => import("@/components/pages/User/AddUser"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function AddUserPage() {
  return <AddUser />;
}
