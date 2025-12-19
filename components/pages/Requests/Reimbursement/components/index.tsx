// components/reimbursement-status-badge.tsx
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";

interface ReimbursementStatusBadgeProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  className?: string;
  showIcon?: boolean;
}

export function ReimbursementStatusBadge({
  status,
  className,
  showIcon = true,
}: ReimbursementStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: <Clock className="w-3 h-3" />,
        };
      case "APPROVED":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "REJECTED":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: <XCircle className="w-3 h-3" />,
        };
      case "PAID":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <DollarSign className="w-3 h-3" />,
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && config.icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
