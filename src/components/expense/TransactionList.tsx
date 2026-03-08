import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Transaction } from "../../types/expense";
import { useState, useMemo } from "react";
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
  Paperclip,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Id } from "@convex/_generated/dataModel";

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export function TransactionList({
  transactions,
  onEditTransaction,
  isLoading,
}: TransactionListProps) {
  const deleteTransaction = useMutation(
    api.functions.transactions.deleteTransaction,
  );
  const { formatCurrency } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL
  const pageParam = parseInt(searchParams.get("page") || "1");
  const perPageParam = parseInt(searchParams.get("perPage") || "25");
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
      newParams.set("perPage", nextPagination.pageSize.toString());
    } else {
      newParams.set("page", (nextPagination.pageIndex + 1).toString());
    }

    setSearchParams(newParams, { replace: true });
  };

  const onSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("q", value);
    } else {
      newParams.delete("q");
    }
    // Reset to page 1 on search
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });
    setColumnFilters(value ? [{ id: "name", value }] : []);
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider"
        >
          Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-muted-foreground text-sm">
          {new Date(row.original.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider"
        >
          Description
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-base">{row.original.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge
              variant="outline"
              className={`text-[10px] h-4.5 px-1.5 font-black uppercase border-none ${
                row.original.type === "expense"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-green-500/10 text-green-600 dark:text-green-400 dark:bg-green-400/10"
              }`}
            >
              {row.original.type === "expense" ? (
                <TrendingDown className="h-2.5 w-2.5 mr-1" />
              ) : (
                <TrendingUp className="h-2.5 w-2.5 mr-1" />
              )}
              {row.original.type}
            </Badge>
            {row.original.category && (
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                • {row.original.category.name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider"
          >
            Amount
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const amount = row.original.amount;
        const isExpense = row.original.type === "expense";
        return (
          <div
            className={`text-right font-black text-lg ${isExpense ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
          >
            {isExpense ? "-" : "+"}
            {formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onEditTransaction(transaction)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this?")) {
                      await deleteTransaction({
                        id: transaction._id as Id<"transactions">,
                      });
                      toast.success("Transaction deleted");
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
                {transaction.receiptUrl && (
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(transaction.receiptUrl!, "_blank")
                    }
                  >
                    <Paperclip className="mr-2 h-4 w-4" /> View Receipt
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 border-none">
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
                  className="h-20 hover:bg-muted/20 border-border/50 cursor-pointer"
                  onClick={() => onEditTransaction(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
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
                  className="h-32 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-6">
          <p className="text-sm font-bold text-muted-foreground whitespace-nowrap">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-muted-foreground">Rows</p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-muted/50 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
