"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface AppDataTableProps {
  columns: string[];
  isLoading: boolean;
  children: ReactNode;
  emptyState?: ReactNode;
  noDataText?: string;
}

export function AppDataTable({
  columns,
  isLoading,
  children,
  noDataText = "No data available",
}: AppDataTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader className="bg-blue-50">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className="font-semibold text-gray-700">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : children || (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="text-gray-500">{noDataText}</div>
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </div>
  );
}
