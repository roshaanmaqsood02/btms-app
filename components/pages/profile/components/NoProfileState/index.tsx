import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function NoProfileState() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <p className="text-gray-600">No profile data available</p>
        <Button
          onClick={() => router.push("/login")}
          className="bg-[rgb(96,57,187)] hover:bg-[rgb(86,47,177)]"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}
