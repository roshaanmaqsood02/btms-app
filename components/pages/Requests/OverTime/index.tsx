import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterIcon } from "lucide-react";
import { useState } from "react";
import { dummyOverTime, type OverTime } from "./constants";
import { AppDataTable } from "@/components/common/tableData";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/statusBadges";
import { TablePagination } from "@/components/common/pagination";

const TABLE_COLUMNS = [
  "ATT ID",
  "NAME",
  "DATES",
  "OVERTIME",
  "PM APPROVAL",
  "TL APPROVAL",
  "HR APPROVAL",
];

export default function OverTime() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use the imported reimbursements data
  const tableData: OverTime[] = dummyOverTime;

  // Calculate pagination
  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = tableData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <div className="space-y-4">
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

      {/* Table Section */}
      <AppDataTable columns={TABLE_COLUMNS} isLoading={isLoading}>
        {currentItems.map((request) => (
          <TableRow key={request.attendence_id} className="hover:bg-gray-50/50">
            <TableCell className="font-medium">
              {request.attendence_id}
            </TableCell>
            <TableCell className="capitalize">{request.name}</TableCell>
            <TableCell>{request.dates}</TableCell>
            <TableCell className="font-medium">{request.overTime}</TableCell>
            <TableCell>
              <StatusBadge status={request.pm_approval} />
            </TableCell>
            <TableCell>
              <StatusBadge status={request.tl_approval} />
            </TableCell>

            <TableCell>
              <StatusBadge status={request.hr_approval} />
            </TableCell>
          </TableRow>
        ))}
      </AppDataTable>

      {/* Pagination Section */}
      <div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          maxVisiblePages={5}
          className="w-full justify-between"
          showResultsInfo={true}
        />
      </div>
    </div>
  );
}
