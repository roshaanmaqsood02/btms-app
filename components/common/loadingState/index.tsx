import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[rgb(96,57,187)] mx-auto" />
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );
}
