"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterIcon } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { dummyLeaveRequests, LeaveRequest } from "./constants";
import { AppDataTable } from "@/components/common/tableData";
import { StatusBadge } from "@/components/common/statusBadges";
import { TablePagination } from "@/components/common/pagination";

const TABLE_COLUMNS = [
  "Leave Type",
  "Total Days",
  "Dates",
  "Leave Status",
  "PM Approval",
  "HR Approval",
];

export default function Leave() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [filterType, setFilterType] = useState<"my_requests" | "all_requests">(
    "my_requests"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<LeaveRequest[]>([]);

  // Simulate loading and filtering
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      let filteredData = [...dummyLeaveRequests];

      // Apply filter based on selection
      if (filterType === "my_requests") {
        // In a real app, you would filter by current user
        filteredData = filteredData.slice(0, 8); // Just for demo
      }

      setTableData(filteredData);
      setIsLoading(false);
      setCurrentPage(1); // Reset to first page when filter changes
    }, 300);

    return () => clearTimeout(timer);
  }, [itemsPerPage, filterType]);

  // Calculate pagination
  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = tableData.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value as "my_requests" | "all_requests");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatLeaveType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleAction = (id: string, action: string) => {
    console.log(`${action} leave request ${id}`);
    // Implement your action logic here
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-end gap-2">
        {/* Items per page */}
        <span className="text-sm font-medium capitalize text-gray-700">
          Items per page:
        </span>

        {/* Items count select */}
        <Select
          value={itemsPerPage.toString()}
          onValueChange={handleItemsPerPageChange}
        >
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
        <Select value={filterType} onValueChange={handleFilterChange}>
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
          Filter
        </Button>

        {/* Add my request */}
        <Button className="h-9 rounded-lg bg-[#6039BB] hover:bg-[#4f2fa1]">
          Add My Request
        </Button>
      </div>

      {/* Table Section */}
      <AppDataTable columns={TABLE_COLUMNS} isLoading={isLoading}>
        {currentItems.map((request) => (
          <TableRow key={request.id} className="hover:bg-gray-50/50">
            <TableCell className="capitalize">
              {formatLeaveType(request.leaveType)}
            </TableCell>
            <TableCell>{request.totalDays}</TableCell>
            <TableCell>{request.dates}</TableCell>
            <TableCell>
              <StatusBadge status={request.leaveStatus} type="leave" />
            </TableCell>
            <TableCell>
              <StatusBadge status={request.pmApproval} />
            </TableCell>
            <TableCell>
              <StatusBadge status={request.hrApproval} />
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
