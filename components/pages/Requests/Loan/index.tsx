"use client";

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
import { dummyLoan, type Loan } from "./constants";
import { AppDataTable } from "@/components/common/tableData";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/statusBadges";
import { TablePagination } from "@/components/common/pagination";

const TABLE_COLUMNS = [
  "ATT ID",
  "NAME",
  "LOAN DATE",
  "LOAN AMOUNT",
  "INSTALLMENT",
  "PAID AMOUNT",
  "REM AMOUNT",
  "HR APPROVAL",
];

export default function Loan() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [filterType, setFilterType] = useState<"my_requests" | "all_requests">(
    "my_requests"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Use the imported reimbursements data
  const tableData: Loan[] = dummyLoan;

  // Calculate pagination
  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = tableData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddRequest = () => {
    alert("Add new reimbursement request");
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
              <TableCell className="capitalize">{request.loanDate}</TableCell>
              <TableCell>{request.loanAmount}</TableCell>
              <TableCell className="font-medium">
                {request.installments}
              </TableCell>
              <TableCell className="font-medium">
                {request.paidAmount}
              </TableCell>
              <TableCell className="font-medium">
                {request.remainingAmount}
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
        <div className="flex items-start justify-start">
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
