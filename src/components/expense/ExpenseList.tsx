import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Expense } from "../../types/expense";
import { useState, useMemo, useEffect } from "react";
import { useSettings } from "../../contexts/SettingsContext";
import { useSearchParams } from "react-router-dom";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Paperclip,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onEditExpense }: ExpenseListProps) {
  const deleteExpense = useMutation(api.functions.expenses.deleteExpense);
  const { settings, formatCurrency } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL
  const pageParam = parseInt(searchParams.get("page") || "1");
  const perPageParam = parseInt(searchParams.get("perPage") || "10");
  const searchParam = searchParams.get("q") || "";

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    searchParam ? [{ id: "name", value: searchParam }] : [],
  );

  const pagination = useMemo(
    () => ({
      pageIndex: pageParam - 1,
      pageSize: perPageParam,
    }),
    [pageParam, perPageParam],
  );

  const setPagination = (updater: any) => {
    const nextPagination =
      typeof updater === "function" ? updater(pagination) : updater;

    const newParams = new URLSearchParams(searchParams);

    // If pageSize changed, reset to page 1
    if (nextPagination.pageSize !== pagination.pageSize) {
      newParams.set("page", "1");
    } else {
      newParams.set("page", (nextPagination.pageIndex + 1).toString());
    }

    newParams.set("perPage", nextPagination.pageSize.toString());
    setSearchParams(newParams, { replace: true });
  };

  const handleDelete = async (expenseId: Id<"expenses">) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      await deleteExpense({ id: expenseId });
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-semibold"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const timestamp = row.getValue("date") as number;
          return new Date(timestamp).toLocaleDateString(settings.language, {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "name",
        header: "Description",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            {row.original.notes && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {row.original.notes}
              </span>
            )}
            {row.original.receiptUrl && (
              <div className="flex items-center text-[10px] text-primary mt-1">
                <Paperclip className="w-3 h-3 mr-1" />
                Receipt Attached
              </div>
            )}
          </div>
        ),
      },
      {
        id: "category",
        accessorFn: (row) => row.category?.name || "Uncategorized",
        header: "Category",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-border"
              style={{
                backgroundColor: row.original.category?.color || "#6b7280",
              }}
            />
            <span className="text-sm">
              {row.original.category?.name || "Uncategorized"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent font-semibold"
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const amount = row.original.amount;
          return (
            <div className="text-right font-bold">{formatCurrency(amount)}</div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const expense = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {expense.receiptUrl && (
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(expense.receiptUrl as string, "_blank")
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" /> View Receipt
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEditExpense(expense)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(expense._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onEditExpense, settings.language, formatCurrency],
  );

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(nextFilters);

      const nameFilter = nextFilters.find((f) => f.id === "name");
      const newParams = new URLSearchParams(searchParams);
      if (nameFilter?.value) {
        newParams.set("q", nameFilter.value as string);
      } else {
        newParams.delete("q");
      }
      // Reset to page 1 on search
      newParams.set("page", "1");
      setSearchParams(newParams, { replace: true });
    },
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: false,
    autoResetPageIndex: false, // Prevent reset on data change (like edit)
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {table.getFilteredRowModel().rows.length} records found
          </span>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No records.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Rows per page
          </p>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
