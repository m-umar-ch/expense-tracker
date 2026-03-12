import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Transaction, Category } from "../../types/expense";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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
  SquareArrowOutUpRight,
  MoreVertical,
  Edit,
  Trash2,
  Paperclip,
  ArrowUpDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export function TransactionList({
  transactions,
  categories,
  onEditTransaction,
  isLoading,
}: TransactionListProps) {
  const deleteTransaction = useMutation(
    api.functions.transactions.deleteTransaction,
  );
  const { settings, formatCurrency } = useSettings();
  const blurClass = settings.privacyMode
    ? "blur-[8px] select-none pointer-events-none transition-all duration-300"
    : "transition-all duration-300";
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [transactionForDetail, setTransactionForDetail] =
    useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Read initial state from URL
  const pageParam = parseInt(searchParams.get("page") || "1");
  const perPageParam = parseInt(searchParams.get("perPage") || "25");
  const searchParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("cid") || "all";

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (searchParam) filters.push({ id: "name", value: searchParam });
    if (categoryParam !== "all")
      filters.push({ id: "categoryId", value: categoryParam });
    return filters;
  });

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income"),
    [categories],
  );
  const otherCategories = useMemo(
    () =>
      categories.filter(
        (c) => !c.type || (c.type !== "expense" && c.type !== "income"),
      ),
    [categories],
  );

  // Sync state with URL params for back/forward support
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (searchParam) filters.push({ id: "name", value: searchParam });
    if (categoryParam !== "all")
      filters.push({ id: "categoryId", value: categoryParam });
    setColumnFilters(filters);
  }, [searchParam, categoryParam]);

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

    setColumnFilters((prev) => {
      const otherFilters = prev.filter((f) => f.id !== "name");
      return value ? [...otherFilters, { id: "name", value }] : otherFilters;
    });
  };

  const onCategoryChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set("cid", value);
    } else {
      newParams.delete("cid");
    }
    // Reset to page 1 on filter
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });

    setColumnFilters((prev) => {
      const otherFilters = prev.filter((f) => f.id !== "categoryId");
      return value && value !== "all"
        ? [...otherFilters, { id: "categoryId", value }]
        : otherFilters;
    });
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "view",
      header: () => (
        <span className="font-bold text-xs uppercase tracking-wider">View</span>
      ),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg Transition-all"
          onClick={() => setTransactionForDetail(row.original)}
          title="View Details"
        >
          <SquareArrowOutUpRight className="h-4 w-4" />
        </Button>
      ),
    },
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
        <span className={cn("font-bold text-base", blurClass)}>{row.original.name}</span>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider"
        >
          Type
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-[10px] h-6 px-2 font-black uppercase border-none ring-1 ring-inset ${
            row.original.type === "expense"
              ? "bg-destructive/10 text-destructive ring-destructive/20"
              : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20 dark:bg-green-400/10"
          }`}
        >
          {row.original.type === "expense" ? (
            <TrendingDown className="h-3 w-3 mr-1" />
          ) : (
            <TrendingUp className="h-3 w-3 mr-1" />
          )}
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent font-bold text-xs uppercase tracking-wider"
        >
          Category
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) =>
        row.original.category ? (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shadow-sm"
              style={{ backgroundColor: row.original.category.color }}
            />
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
              {row.original.category.name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Uncategorized
          </span>
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
            className={`text-right font-black text-lg ${isExpense ? "text-destructive" : "text-green-600 dark:text-green-400"} ${blurClass}`}
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
          <div className="flex items-center justify-end gap-1">
            {transaction.receiptUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg Transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(transaction.receiptUrl!, "_blank");
                }}
                title="View Receipt"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg Transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onEditTransaction(transaction);
              }}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg Transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setTransactionToDelete(transaction);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
    autoResetPageIndex: false,
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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9 h-10 bg-muted/20 border-border/50 rounded-xl"
          />
        </div>

        <div className="w-full md:w-[240px]">
          <Select
            value={
              (table.getColumn("categoryId")?.getFilterValue() as string) ??
              "all"
            }
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className="bg-muted/20 border-border/50 rounded-xl font-medium">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="all" className="font-bold">
                All Categories
              </SelectItem>

              {expenseCategories.length > 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel className="font-black text-destructive/70 uppercase tracking-tighter text-[10px] px-2 py-1.5">
                      Expense Categories
                    </SelectLabel>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}

              {incomeCategories.length > 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel className="font-black text-green-600/70 dark:text-green-400/70 uppercase tracking-tighter text-[10px] px-2 py-1.5">
                      Income Categories
                    </SelectLabel>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}

              {otherCategories.length > 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel className="font-black text-muted-foreground/70 uppercase tracking-tighter text-[10px] px-2 py-1.5">
                      Other Categories
                    </SelectLabel>
                    {otherCategories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
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
                  className="h-14 hover:bg-muted/20 border-border/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
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

      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={(open) => !open && setTransactionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transaction{" "}
              <span className="font-bold text-foreground">
                "{transactionToDelete?.name}"
              </span>{" "}
              for{" "}
              <span className="font-bold text-foreground">
                {transactionToDelete &&
                  formatCurrency(transactionToDelete.amount)}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                if (!transactionToDelete) return;

                setIsDeleting(true);
                try {
                  await deleteTransaction({
                    id: transactionToDelete._id as Id<"transactions">,
                  });
                  toast.success("Transaction deleted");
                  setTransactionToDelete(null);
                } catch (error) {
                  toast.error("Failed to delete transaction");
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!transactionForDetail}
        onOpenChange={(open) => !open && setTransactionForDetail(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-5xl sm:w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 border border-border/50 shadow-2xl bg-card rounded-2xl sm:rounded-3xl">
          {transactionForDetail && (
            <div className="flex flex-col">
              {/* Header with Background Pattern/Color */}
              <div
                className={`h-28 sm:h-40 w-full relative overflow-hidden flex items-end p-6 sm:px-12 ${
                  transactionForDetail.type === "expense"
                    ? "bg-destructive/10"
                    : "bg-green-500/10"
                }`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  {transactionForDetail.type === "expense" ? (
                    <TrendingDown className="h-32 w-32 sm:h-40 sm:w-40 -translate-y-4 translate-x-4" />
                  ) : (
                    <TrendingUp className="h-32 w-32 sm:h-40 sm:w-40 -translate-y-4 translate-x-4" />
                  )}
                </div>
                <div className="z-10 flex flex-col gap-1.5 sm:gap-2">
                  <Badge
                    variant="outline"
                    className={`w-fit text-[10px] font-black uppercase border-none ring-1 ring-inset px-2.5 py-0.5 bg-background/50 backdrop-blur-md ${
                      transactionForDetail.type === "expense"
                        ? "text-destructive ring-destructive/30"
                        : "text-green-700 dark:text-green-400 ring-green-500/30"
                    }`}
                  >
                    {transactionForDetail.type}
                  </Badge>
                  <DialogTitle className={cn("text-2xl sm:text-3xl font-bold tracking-tight text-foreground line-clamp-1", blurClass)}>
                    {transactionForDetail.name}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Transaction details for {transactionForDetail.name}
                  </DialogDescription>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
                {/* Details Column */}
                <div className="p-6 sm:p-12 space-y-8 sm:space-y-10 border-b lg:border-b-0 lg:border-r border-border/40">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-1 sm:space-y-1.5">
                      <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Amount
                      </p>
                      <p
                        className={`text-2xl sm:text-3xl font-black tracking-tight ${
                          transactionForDetail.type === "expense"
                            ? "text-destructive"
                            : "text-green-600 dark:text-green-400"
                        } ${blurClass}`}
                      >
                        {transactionForDetail.type === "expense" ? "-" : "+"}
                        {formatCurrency(transactionForDetail.amount)}
                      </p>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5 sm:text-right">
                      <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Date
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-foreground mt-0 sm:mt-1">
                        {new Date(transactionForDetail.date).toLocaleDateString(
                          undefined,
                          {
                            dateStyle: "long",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2 sm:space-y-2.5">
                      <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Category
                      </p>
                      {transactionForDetail.category ? (
                        <div className="flex items-center gap-3 sm:gap-4 bg-muted/20 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner shrink-0"
                            style={{
                              backgroundColor:
                                transactionForDetail.category.color,
                            }}
                          >
                            <span className="text-white text-lg sm:text-xl font-bold drop-shadow-sm">
                              {transactionForDetail.category.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-base sm:text-lg uppercase tracking-tight text-foreground leading-tight truncate">
                              {transactionForDetail.category.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                              Category
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-muted/20 rounded-xl sm:rounded-2xl border border-dashed border-border/50 text-sm text-muted-foreground italic">
                          Uncategorized
                        </div>
                      )}
                    </div>

                    {transactionForDetail.notes && (
                      <div className="space-y-2 sm:space-y-2.5">
                        <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                          Notes
                        </p>
                        <div className="bg-muted/10 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-border/50">
                          <p className={cn("text-sm sm:text-base text-foreground/80 leading-relaxed font-medium line-clamp-4 sm:line-clamp-none", blurClass)}>
                            {transactionForDetail.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Receipt Column */}
                <div className="bg-muted/5 p-6 sm:p-12 flex flex-col gap-4 sm:gap-6">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      Receipt Attachment
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                      Digital proof of transaction
                    </p>
                  </div>

                  {transactionForDetail.receiptUrl ? (
                    <div className="relative group w-full flex-1 aspect-[4/3] sm:aspect-auto sm:min-h-[300px] rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 shadow-lg bg-card mt-1 sm:mt-2">
                      <img
                        src={transactionForDetail.receiptUrl}
                        alt="Receipt"
                        className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", blurClass)}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="font-bold rounded-full shadow-lg px-6"
                          onClick={() =>
                            window.open(transactionForDetail.receiptUrl!, "_blank")
                          }
                        >
                          View Full Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex-1 min-h-[180px] sm:min-h-[300px] rounded-xl sm:rounded-2xl border border-dashed border-border/50 bg-background/50 flex flex-col items-center justify-center text-muted-foreground p-6 sm:p-8 text-center gap-3 sm:gap-4 transition-colors hover:bg-muted/30 mt-1 sm:mt-2">
                      <div className="p-3 sm:p-4 bg-muted/50 rounded-full shadow-inner">
                        <Paperclip className="h-6 w-6 sm:h-8 sm:w-8 opacity-40 rotate-15" />
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground/70">
                          No Receipt
                        </p>
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground max-w-[180px]">
                          There is no digital receipt attached to this transaction.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
