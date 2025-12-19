// components/status-badge.tsx
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "leave" | "approval";
  className?: string;
}

export function StatusBadge({
  status,
  type = "approval",
  className,
}: StatusBadgeProps) {
  const getStatusStyles = () => {
    if (type === "leave") {
      switch (status.toLowerCase()) {
        case "paid":
          return "bg-green-100 text-green-500";
        case "unpaid":
          return "bg-red-100 text-red-500";
        default:
          return "bg-gray-100 text-gray-500";
      }
    } else {
      switch (status.toLowerCase()) {
        case "approved":
          return "bg-green-100 text-green-500";
        case "pending":
          return "bg-yellow-100 text-yellow-500";
        case "rejected":
          return "bg-red-100 text-red-500";
        default:
          return "bg-gray-100 text-gray-500";
      }
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        getStatusStyles(),
        className
      )}
    >
      {status}
    </span>
  );
}
