import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Expense } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import { useState } from "react";

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onEditExpense }: ExpenseListProps) {
  const deleteExpense = useMutation(api.expenses.deleteExpense);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (expenseId: Id<"expenses">) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      await deleteExpense({ id: expenseId });
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = a.date - b.date;
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'category':
        comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const SortIcon = ({ field }: { field: string }) => (
    <svg className={`w-4 h-4 ml-1 transition-colors ${sortBy === field ? 'text-blue-600' : 'text-gray-400'}`} 
         fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d={sortBy === field && sortOrder === 'asc' ? 
              "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
    </svg>
  );

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Start tracking your expenses by clicking the "Add Expense" button above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header with Search and Stats */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Expense History</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredExpenses.length} of {expenses.length} expenses
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Table View */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
                >
                  Date & Time
                  <SortIcon field="date" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Description
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
                >
                  Category
                  <SortIcon field="category" />
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center justify-end text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
                >
                  Amount
                  <SortIcon field="amount" />
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {sortedExpenses.map((expense, index) => (
              <tr key={expense._id} className={`hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}>
                {/* Date & Time */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{formatDate(expense.date)}</span>
                    <span className="text-xs text-gray-500">{formatTime(expense.date)}</span>
                  </div>
                </td>

                {/* Description */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{expense.name}</span>
                    {expense.notes && (
                      <span className="text-xs text-gray-500 mt-1 line-clamp-2">{expense.notes}</span>
                    )}
                    {expense.receiptUrl && (
                      <div className="flex items-center mt-1">
                        <svg className="w-3 h-3 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-blue-600">Receipt</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: expense.category?.color || "#6b7280" }}
                    />
                    <span className="text-sm text-gray-700">{expense.category?.name || 'Uncategorized'}</span>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    {expense.receiptUrl && (
                      <button
                        onClick={() => window.open(expense.receiptUrl, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View receipt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit expense"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {sortedExpenses.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Total: {formatCurrency(sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </span>
            <span>
              {sortedExpenses.length} expense{sortedExpenses.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
