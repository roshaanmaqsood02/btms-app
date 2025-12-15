import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NavigationProps {
  onLogout: () => void;
}

export function Navigation({ onLogout }: NavigationProps) {
  const router = useRouter();

  return (
    <nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={onLogout}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
