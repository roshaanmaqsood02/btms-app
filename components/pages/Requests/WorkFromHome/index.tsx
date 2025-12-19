import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterIcon } from "lucide-react";

export default function WorkFromHome() {
  return (
    <div className="flex items-center justify-end gap-2">
      {/* Items per page */}
      <span className="text-sm font-medium capitalize text-gray-700">
        Items per page:
      </span>

      {/* Items count select */}
      <Select defaultValue="10">
        <SelectTrigger className="h-9 w-[80px] bg-white rounded-lg">
          <SelectValue placeholder="10" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>

      {/* My requests select */}
      <Select defaultValue="my_requests">
        <SelectTrigger className="h-9 w-[150px] bg-white rounded-lg">
          <SelectValue placeholder="My Requests" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="my_requests">My Requests</SelectItem>
          <SelectItem value="all_requests">All Requests</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter button */}
      <Button variant="outline" className="h-9 rounded-lg gap-2">
        <FilterIcon size={16} />
      </Button>

      {/* Add my request */}
      <Button className="h-9 rounded-lg bg-[#6039BB] hover:bg-[#4f2fa1]">
        + Add
      </Button>
    </div>
  );
}
