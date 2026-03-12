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
  SquareArrowOutUpRight,
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
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [transactionForDetail, setTransactionForDetail] =
    useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <span className="font-bold text-base">{row.original.name}</span>
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
        <DialogContent className="max-w-2xl overflow-hidden p-0 border-none shadow-2xl bg-background/95 backdrop-blur-xl">
          {transactionForDetail && (
            <div className="flex flex-col">
              {/* Header with Background Pattern/Color */}
              <div
                className={`h-32 w-full relative overflow-hidden flex items-end p-6 ${
                  transactionForDetail.type === "expense"
                    ? "bg-destructive/10"
                    : "bg-green-500/10"
                }`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  {transactionForDetail.type === "expense" ? (
                    <TrendingDown className="h-32 w-32" />
                  ) : (
                    <TrendingUp className="h-32 w-32" />
                  )}
                </div>
                <div className="z-10 flex flex-col gap-1">
                  <Badge
                    variant="outline"
                    className={`w-fit text-[10px] font-black uppercase border-none ring-1 ring-inset ${
                      transactionForDetail.type === "expense"
                        ? "bg-destructive/20 text-destructive ring-destructive/30"
                        : "bg-green-500/20 text-green-700 dark:text-green-400 ring-green-500/30"
                    }`}
                  >
                    {transactionForDetail.type}
                  </Badge>
                  <DialogTitle className="text-3xl font-black tracking-tight">
                    {transactionForDetail.name}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Transaction details for {transactionForDetail.name}
                  </DialogDescription>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Details Column */}
                <div className="p-8 space-y-8 border-r border-border/50">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Amount
                      </p>
                      <p
                        className={`text-2xl font-black ${
                          transactionForDetail.type === "expense"
                            ? "text-destructive"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {transactionForDetail.type === "expense" ? "-" : "+"}
                        {formatCurrency(transactionForDetail.amount)}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Date
                      </p>
                      <p className="text-base font-bold text-foreground">
                        {new Date(transactionForDetail.date).toLocaleDateString(
                          undefined,
                          {
                            dateStyle: "long",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Category
                      </p>
                      {transactionForDetail.category ? (
                        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner"
                            style={{
                              backgroundColor:
                                transactionForDetail.category.color,
                            }}
                          >
                            <span className="text-white text-xl font-bold">
                              {transactionForDetail.category.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tight">
                              {transactionForDetail.category.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                              Transaction Category
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-muted/30 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground italic">
                          Uncategorized
                        </div>
                      )}
                    </div>

                    {transactionForDetail.notes && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Notes
                        </p>
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                          <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                            {transactionForDetail.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Receipt Column */}
                <div className="bg-muted/10 p-8 flex flex-col items-center justify-center gap-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest self-start">
                    Receipt Attachment
                  </p>
                  {transactionForDetail.receiptUrl ? (
                    <div className="relative group w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-border/50 shadow-lg bg-card">
                      <img
                        src={transactionForDetail.receiptUrl}
                        alt="Receipt"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="font-bold rounded-full"
                          onClick={() =>
                            window.open(transactionForDetail.receiptUrl!, "_blank")
                          }
                        >
                          View Full Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground p-6 text-center gap-3">
                      <Paperclip className="h-12 w-12 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-tight opacity-50">
                        No digital receipt attached
                      </p>
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
