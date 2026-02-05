import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { Expense } from "../../types/expense";
import { formatCurrency } from "../../utils/currency";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit, 
  Trash2, 
  Eye, 
  Paperclip,
  Receipt,
  FileText
} from "lucide-react";

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

  const SortButton = ({ field, children }: { field: 'date' | 'amount' | 'category'; children: React.ReactNode }) => {
    const isActive = sortBy === field;
    const Icon = isActive ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort(field)}
        className="h-auto p-0 font-medium text-xs hover:text-foreground"
      >
        {children}
        <Icon className={`ml-1 h-3 w-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
      </Button>
    );
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-lg mb-2">No expenses found</CardTitle>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start tracking your expenses by clicking the "Add Expense" button above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Expense History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredExpenses.length} of {expenses.length} expenses
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">
                  <SortButton field="date">Date & Time</SortButton>
                </TableHead>
                <TableHead className="px-6">Description</TableHead>
                <TableHead className="px-6">
                  <SortButton field="category">Category</SortButton>
                </TableHead>
                <TableHead className="text-right px-6">
                  <SortButton field="amount">Amount</SortButton>
                </TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedExpenses.map((expense) => (
                <TableRow key={expense._id} className="hover:bg-muted/50">
                  <TableCell className="px-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">{formatDate(expense.date)}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(expense.date)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6">
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium">{expense.name}</span>
                      {expense.notes && (
                        <span className="text-sm text-muted-foreground line-clamp-2">{expense.notes}</span>
                      )}
                      {expense.receiptUrl && (
                        <div className="flex items-center text-xs text-primary">
                          <Paperclip className="w-3 h-3 mr-1" />
                          Receipt
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-6">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: expense.category?.color || "#6b7280" }}
                      />
                      <Badge variant="secondary" className="text-xs">
                        {expense.category?.name || 'Uncategorized'}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="text-right px-6">
                    <span className="font-semibold">
                      {formatCurrency(expense.amount)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-1">
                      {expense.receiptUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(expense.receiptUrl, '_blank')}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditExpense(expense)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense._id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sortedExpenses.length > 0 && (
          <>
            <Separator />
            <div className="px-6 py-4 bg-muted/30">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">
                  Total: {formatCurrency(sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                </span>
                <span className="text-muted-foreground">
                  {sortedExpenses.length} expense{sortedExpenses.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
