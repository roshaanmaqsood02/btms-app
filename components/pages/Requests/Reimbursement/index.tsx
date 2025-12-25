"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterIcon, Eye, Edit, Trash2 } from "lucide-react";
import { TablePagination } from "@/components/common/pagination";
import { AppDataTable } from "@/components/common/tableData";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/statusBadges";
import { dummyReimbursements, type Reimbursement } from "./constants";

const TABLE_COLUMNS = [
  "ATT ID",
  "NAME",
  "TYPE",
  "RECEIPT DATE",
  "TOTAL EXPENSE",
  "HR APPROVAL",
];

export default function Reimbursement() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [filterType, setFilterType] = useState<"my_requests" | "all_requests">(
    "my_requests"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use the imported reimbursements data
  const tableData: Reimbursement[] = dummyReimbursements;

  // Calculate pagination
  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = tableData.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value as "my_requests" | "all_requests");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddRequest = () => {
    alert("Add new reimbursement request");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm font-medium capitalize text-gray-700">
          Items per page:
        </span>

        <Select
          value={itemsPerPage.toString()}
          onValueChange={handleItemsPerPageChange}
        >
          <SelectTrigger className="h-9 w-[80px] bg-white rounded-lg border">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={handleFilterChange}>
          <SelectTrigger className="h-9 w-[150px] bg-white rounded-lg border">
            <SelectValue placeholder="My Requests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="my_requests">My Requests</SelectItem>
            <SelectItem value="all_requests">All Requests</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="h-9 rounded-lg gap-2 border">
          <FilterIcon size={16} />
          Filter
        </Button>
        <Button
          className="h-9 rounded-lg bg-[#6039BB] hover:bg-[#4f2fa1] text-white"
          onClick={handleAddRequest}
        >
          + Add
        </Button>
      </div>

      {/* Table */}
      <AppDataTable columns={TABLE_COLUMNS} isLoading={isLoading}>
        {currentItems.length > 0 ? (
          currentItems.map((request, index) => (
            <TableRow
              key={`${request.attendence_id}-${index}`}
              className="hover:bg-gray-50/50"
            >
              <TableCell className="font-medium">
                {request.attendence_id}
              </TableCell>
              <TableCell>{request.name}</TableCell>
              <TableCell className="capitalize">{request.type}</TableCell>
              <TableCell>{formatDate(request.receiptDate)}</TableCell>
              <TableCell className="font-medium">
                {request.totalExpense}
              </TableCell>
              <TableCell>
                <StatusBadge status={request.hr_approval} />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={TABLE_COLUMNS.length}
              className="text-center py-8"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-gray-500 mb-2">
                  No reimbursement requests found
                </div>
                <Button
                  variant="outline"
                  onClick={handleAddRequest}
                  className="mt-2"
                >
                  Create your first request
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )}
      </AppDataTable>

      {/* Pagination */}
      {totalItems > 0 && (
        <div>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            className="w-full justify-between"
            showResultsInfo={true}
          />
        </div>
      )}
    </div>
  );
}
