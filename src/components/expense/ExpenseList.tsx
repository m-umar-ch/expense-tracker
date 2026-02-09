import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Expense } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  Paperclip,
  Database,
  AlertTriangle,
  FileText,
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
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleDelete = async (expenseId: Id<"expenses">) => {
    if (
      !confirm(
        "CONFIRM DELETION: ARE YOU SURE YOU WANT TO PERMANENTLY DELETE THIS EXPENSE RECORD?",
      )
    )
      return;

    try {
      await deleteExpense({ id: expenseId });
      toast.success("EXPENSE RECORD DELETED FROM DATABASE");
    } catch (error) {
      toast.error("DELETION FAILED - SYSTEM ERROR");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSort = (field: "date" | "amount" | "category") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = a.date - b.date;
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
      case "category":
        comparison = (a.category?.name || "").localeCompare(
          b.category?.name || "",
        );
        break;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: "date" | "amount" | "category";
    children: React.ReactNode;
  }) => {
    const isActive = sortBy === field;
    const Icon = isActive
      ? sortOrder === "asc"
        ? ArrowUp
        : ArrowDown
      : ArrowUpDown;

    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-2 font-black uppercase tracking-wider text-xs text-white hover:text-red-500 transition-colors"
      >
        {children}
        <Icon
          className={`w-3 h-3 ${isActive ? "text-red-500" : "text-white"}`}
        />
      </button>
    );
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-black border-4 border-red-500 text-white font-mono p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-black" />
          </div>
          <div className="text-2xl font-black uppercase tracking-wider text-red-500 mb-4">
            NO EXPENSE RECORDS FOUND
          </div>
          <div className="text-white max-w-sm mx-auto uppercase text-sm tracking-wide">
            DATABASE EMPTY. INITIATE EXPENSE TRACKING BY ADDING YOUR FIRST
            FINANCIAL RECORD.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-4 border-red-500 text-white font-mono">
      {/* Header Section */}
      <div className="border-b-4 border-red-500 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Database className="w-8 h-8 text-red-500" />
              <div className="text-3xl font-black uppercase tracking-wider text-red-500">
                EXPENSE DATABASE
              </div>
            </div>
            <div className="text-white uppercase tracking-wide">
              {filteredExpenses.length} OF {expenses.length} RECORDS DISPLAYED
              {searchTerm && ` | SEARCH: "${searchTerm.toUpperCase()}"`}
            </div>
          </div>

          {/* Search Interface */}
          <div className="relative w-full sm:w-80">
            <div className="text-xs font-black uppercase tracking-wider text-white mb-2">
              SEARCH DATABASE
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
              <Input
                type="text"
                placeholder="ENTER SEARCH TERMS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-black border-2 border-white text-white placeholder-gray-400 font-mono font-bold uppercase tracking-wide focus:border-red-500 focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-red-500 text-black border-b-4 border-red-500">
            <div className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-3">
                <SortButton field="date">DATETIME</SortButton>
              </div>
              <div className="col-span-4">
                <span className="font-black uppercase tracking-wider text-xs">
                  DESCRIPTION
                </span>
              </div>
              <div className="col-span-2">
                <SortButton field="category">CATEGORY</SortButton>
              </div>
              <div className="col-span-2 text-right">
                <SortButton field="amount">AMOUNT</SortButton>
              </div>
              <div className="col-span-1 text-right">
                <span className="font-black uppercase tracking-wider text-xs">
                  ACTIONS
                </span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="bg-black">
            {paginatedExpenses.map((expense, index) => (
              <div
                key={expense._id}
                className={`grid grid-cols-12 gap-4 p-4 items-center border-b-2 border-white hover:bg-red-500 hover:text-black transition-colors group ${
                  index % 2 === 0 ? "bg-black" : "bg-gray-900"
                }`}
              >
                {/* Date & Time */}
                <div className="col-span-3">
                  <div className="space-y-1">
                    <div className="text-sm font-black tracking-wider">
                      {formatDate(expense.date)}
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-black">
                      {formatTime(expense.date)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-4">
                  <div className="space-y-1">
                    <div className="font-black tracking-wide uppercase text-sm">
                      {expense.name}
                    </div>
                    {expense.notes && (
                      <div className="text-xs text-gray-400 group-hover:text-black line-clamp-2 uppercase">
                        {expense.notes}
                      </div>
                    )}
                    {expense.receiptUrl && (
                      <div className="flex items-center text-xs text-red-500 group-hover:text-black">
                        <Paperclip className="w-3 h-3 mr-1" />
                        <span className="font-black uppercase tracking-wider">
                          RECEIPT ATTACHED
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 border border-white group-hover:border-black"
                      style={{
                        backgroundColor: expense.category?.color || "#6b7280",
                      }}
                    />
                    <div className="text-xs font-black uppercase tracking-wider">
                      {expense.category?.name || "UNCATEGORIZED"}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="col-span-2 text-right">
                  <div className="text-lg font-black tracking-wider">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 text-right">
                  <div className="flex justify-end gap-1">
                    {expense.receiptUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          window.open(expense.receiptUrl, "_blank")
                        }
                        className="h-8 w-8 text-white hover:text-black hover:bg-white border border-white group-hover:border-black"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditExpense(expense)}
                      className="h-8 w-8 text-white hover:text-black hover:bg-white border border-white group-hover:border-black"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense._id)}
                      className="h-8 w-8 text-red-500 hover:text-black hover:bg-red-500 border border-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {sortedExpenses.length > 0 && (
        <div className="border-t-4 border-red-500 bg-black p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-4">
              <span className="font-black uppercase text-white text-sm">
                RECORDS PER PAGE:
              </span>
              <div className="flex gap-2">
                {[5, 10, 25, 50].map((items) => (
                  <Button
                    key={items}
                    onClick={() => handleItemsPerPageChange(items)}
                    className={`px-3 py-1 text-sm font-black uppercase border-2 ${
                      itemsPerPage === items
                        ? "bg-red-500 text-black border-red-500"
                        : "bg-black text-white border-white hover:bg-white hover:text-black"
                    }`}
                  >
                    {items}
                  </Button>
                ))}
              </div>
            </div>

            {/* Page info */}
            <div className="text-white font-bold uppercase text-sm text-center">
              SHOWING {startIndex + 1}-
              {Math.min(endIndex, sortedExpenses.length)} OF{" "}
              {sortedExpenses.length} RECORDS
              <br />
              PAGE {currentPage} OF {totalPages}
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 bg-black text-white border-2 border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 bg-black text-white border-2 border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 w-8 p-0 text-sm font-black ${
                        currentPage === pageNum
                          ? "bg-red-500 text-black border-2 border-red-500"
                          : "bg-black text-white border-2 border-white hover:bg-white hover:text-black"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 bg-black text-white border-2 border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 bg-black text-white border-2 border-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Summary */}
      {sortedExpenses.length > 0 && (
        <div className="border-t-4 border-red-500 bg-red-500 text-black p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-lg font-black uppercase tracking-wider">
                DATABASE SUMMARY
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tracking-wider">
                {formatCurrency(
                  sortedExpenses.reduce(
                    (sum, expense) => sum + expense.amount,
                    0,
                  ),
                )}
              </div>
              <div className="text-xs font-black uppercase tracking-wider">
                {sortedExpenses.length} RECORD
                {sortedExpenses.length !== 1 ? "S" : ""} TOTAL
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
