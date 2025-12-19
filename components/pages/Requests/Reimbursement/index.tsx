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
import { FilterIcon } from "lucide-react";
import { TablePagination } from "@/components/common/pagination";
import { AppDataTable } from "@/components/common/tableData";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/statusBadges";
import { dummyReimbursements, type Reimbursement } from "./constants";

const TABLE_COLUMNS = [
  "ID",
  "Employee",
  "Expense Date",
  "Category",
  "Description",
  "Amount",
  "Status",
  "Submitted Date",
  "Actions",
];

export default function Reimbursement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState<"my_requests" | "all_requests">(
    "my_requests"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Use the dummy reimbursements data
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEmployeeDisplay = (employeeName: string, employeeId: string) => {
    return (
      <div>
        <div className="font-medium">{employeeName}</div>
        <div className="text-sm text-gray-500">{employeeId}</div>
      </div>
    );
  };

  const handleView = (id: string) => {
    console.log(`View reimbursement ${id}`);
    // Implement view logic
  };

  const handleEdit = (id: string) => {
    console.log(`Edit reimbursement ${id}`);
    // Implement edit logic
  };

  const handleDelete = (id: string) => {
    console.log(`Delete reimbursement ${id}`);
    // Implement delete logic
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
          currentItems.map((request) => (
            <TableRow key={request.id} className="hover:bg-gray-50/50">
              <TableCell className="font-medium">{request.id}</TableCell>
              <TableCell>
                {getEmployeeDisplay(request.employeeName, request.employeeId)}
              </TableCell>
              <TableCell>{formatDate(request.expenseDate)}</TableCell>
              <TableCell className="capitalize">{request.category}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {request.description}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(request.amount)}
              </TableCell>
              <TableCell>
                <StatusBadge status={request.status} />
              </TableCell>
              <TableCell>{formatDate(request.submittedDate)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(request.id)}
                    className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(request.id)}
                    className="h-8 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(request.id)}
                    className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
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
        <div className="flex items-center justify-between">
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
