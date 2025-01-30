import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TransactionForm from '../components/TransactionForm';
import { addTransaction, getRecentTransactions, updateTransaction, deleteTransaction } from '../services/transactionService';
import { format, parseISO } from 'date-fns';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function Expenses() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateRange: 'all',
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
    status: 'all'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const fetchTransactions = async (isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingTransactions(true);
    }

    try {
      const result = await getRecentTransactions(currentUser.uid, isLoadMore ? lastDoc : null);
      setTransactions(prev => isLoadMore ? [...prev, ...result.transactions] : result.transactions);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      // Remove console.error
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoadingTransactions(false);
      }
    }
  };

  const handleAddTransaction = async (transaction) => {
    setIsLoading(true);
    try {
      await addTransaction(currentUser.uid, transaction);
      await fetchTransactions();
    } catch (error) {
      // Remove console.error
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdateTransaction = async (updatedData) => {
    setIsLoading(true);
    try {
      await updateTransaction(currentUser.uid, editingTransaction.id, updatedData);
      await fetchTransactions();
      setEditingTransaction(null);
    } catch (error) {
      // Remove console.error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    const formRef = document.querySelector('form');
    if (formRef) {
      formRef.reset();
    }
    setEditingTransaction(null);
  };

  const handleDeleteClick = (transaction) => {
    setDeletingTransaction(transaction);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;

    setIsDeleting(true);
    try {
      await deleteTransaction(deletingTransaction.id);
      await fetchTransactions();
      setDeleteModalOpen(false);
      setDeletingTransaction(null);
    } catch (error) {
      // Remove console.error
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLoadMore = () => {
    fetchTransactions(true);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    return [...transactions].filter(transaction => {
      // Type filter
      if (filters.type !== 'all' && transaction.type !== filters.type) return false;
      
      // Category filter
      if (filters.category !== 'all' && transaction.category !== filters.category) return false;
      
      // Search filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.category?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        const diffTime = Math.abs(today - transactionDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today': return diffDays <= 1;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case 'year': return diffDays <= 365;
          default: return true;
        }
      }

      return true;
    }).sort((a, b) => {
      const direction = filters.sortOrder === 'desc' ? -1 : 1;
      
      switch (filters.sortBy) {
        case 'date':
          return (new Date(a.date) - new Date(b.date)) * direction;
        case 'amount':
          return (a.amount - b.amount) * direction;
        case 'category':
          return a.category.localeCompare(b.category) * direction;
        default:
          return 0;
      }
    });
  }, [transactions, filters]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(transactions.map(t => t.categoryName || t.category))];
    return uniqueCategories.filter(Boolean); // Remove any null/undefined values
  }, [transactions]);

  const renderMobileEmptyState = () => (
    <div className="text-center py-12 px-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">No transactions yet</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
        Get started by adding your first transaction using the form above
      </p>
    </div>
  );

  const getCategoryName = (transaction) => {
    return transaction.categoryName || 'Unknown Category';
  };

  const getFormattedType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const renderMobileTransactionCard = (transaction, index) => {
    const isIncome = transaction.type === 'income';

    return (
      <div
        key={`mobile-transaction-${transaction.id}`}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 
                 border border-gray-100 overflow-hidden"
      >
        {/* Card Badge */}
        <div className={`h-1 ${isIncome ? 'bg-green-500' : 'bg-red-500'}`} />

        {/* Card Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${isIncome ? 'bg-green-50' : 'bg-red-50'
                }`}>
                <svg className={`w-5 h-5 ${isIncome ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isIncome ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M2 4v16h20M12 18V8m0 10l4-4m-4 4l-4-4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M2 4v16h20M12 8v10m0-10l4 4m-4-4l-4 4" />
                  )}
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{getCategoryName(transaction)}</h4>
                <p className="text-xs text-gray-500 mt-0.5">#{index + 1}</p>
              </div>
            </div>
            <span className={`text-lg font-semibold tabular-nums ${isIncome ? 'text-green-600' : 'text-red-600'
              }`}>
              ${transaction.amount.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          {transaction.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{transaction.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(transaction.date), 'MMM dd, yyyy')}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEditTransaction(transaction)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 
                         rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteClick(transaction)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 
                         rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTransactionRow = (transaction, index) => (
    <tr key={`desktop-transaction-${transaction.id}`} className="hover:bg-gray-50">
      <td className="px-4 py-3 text-xs text-gray-500">
        {index + 1}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {format(new Date(transaction.date), 'MMM dd, yyyy')}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 rounded-full text-xs
          ${transaction.type === 'income'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'}`}>
          {getFormattedType(transaction.type)}
        </span>
      </td>
      <td className="px-4 py-3">{getCategoryName(transaction)}</td>
      <td className="px-4 py-3 text-gray-500">{transaction.description}</td>
      <td className={`px-4 py-3 text-right font-medium
        ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
        ${transaction.amount.toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditTransaction(transaction)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Edit transaction"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(transaction)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete transaction"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );

  const renderFilters = () => (
    <div className="border-b border-gray-200">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Transactions</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Toggle filters"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pr-8 border border-gray-200 rounded-lg text-sm"
              />
              <svg className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select>

            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className={`w-5 h-5 transform transition-transform ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className={`sm:hidden mt-4 space-y-4 ${showFilters ? 'block' : 'hidden'}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg"
            />
            <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="flex items-center gap-3">
              {['date', 'amount', 'category'].map((sortType) => (
                <button
                  key={sortType}
                  onClick={() => handleFilterChange('sortBy', sortType)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium
                    ${filters.sortBy === sortType 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
                </button>
              ))}
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-gray-50 rounded-lg"
              >
                <svg className={`w-5 h-5 transform transition-transform ${
                  filters.sortOrder === 'desc' ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.type !== 'all' || filters.dateRange !== 'all' || filters.searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
              {filters.type !== 'all' && (
                <span className="px-2 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg">
                  {getFormattedType(filters.type)}
                </span>
              )}
              {filters.dateRange !== 'all' && (
                <span className="px-2 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg">
                  {filters.dateRange}
                </span>
              )}
              {filters.searchQuery && (
                <span className="px-2 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg">
                  Search: {filters.searchQuery}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden
            ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Mobile Header */}
              <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm mb-6">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      onClick={() => setIsMobileMenuOpen(true)}
                      aria-label="Open menu"
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <div>
                      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                        Manage Expenses
                      </h1>
                      <p className="text-sm text-gray-600 hidden sm:block">
                        Add and view your transactions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Subheader */}
                <div className="sm:hidden -mt-2 pb-4">
                  <p className="text-sm text-gray-600">Add and view your transactions</p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Transaction Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                          </h2>
                          <p className="text-indigo-100 text-sm">
                            {editingTransaction ? 'Update your transaction details' : 'Record your income or expense'}
                          </p>
                        </div>
                      </div>
                      {editingTransaction && (
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Cancel editing"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <TransactionForm
                      onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                      isLoading={isLoading}
                      editData={editingTransaction}
                      onCancel={handleCancelEdit}
                    />
                  </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {renderFilters()}
                  {/* Mobile Transaction List */}
                  <div className="sm:hidden space-y-4 p-4">
                    {isLoadingTransactions ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="inline-flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-t-indigo-600 border-indigo-200 rounded-full animate-spin" />
                          <span className="text-sm text-gray-500">Loading transactions...</span>
                        </div>
                      </div>
                    ) : filteredTransactions.length === 0 ? (
                      renderMobileEmptyState()
                    ) : (
                      <div className="space-y-4">
                        {filteredTransactions.map((transaction, index) =>
                          renderMobileTransactionCard(transaction, index)
                        )}
                      </div>
                    )}
                  </div>

                  {/* Desktop Transaction List */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {isLoadingTransactions ? (
                          <tr>
                            <td colSpan="7" className="px-4 py-12">
                              <div className="flex items-center justify-center">
                                <div className="inline-flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-t-indigo-600 border-indigo-200 rounded-full animate-spin" />
                                  <span className="text-sm text-gray-500">Loading transactions...</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-4 py-12">
                              <div className="text-center">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-gray-900">No transactions found</h3>
                                <p className="mt-2 text-sm text-gray-500">Get started by adding your first transaction.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <>
                            {filteredTransactions.map((transaction, index) =>
                              renderTransactionRow(transaction, index)
                            )}
                            {hasMore && (
                              <tr>
                                <td colSpan="7" className="px-4 py-4">
                                  <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="w-full py-2 flex items-center justify-center text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  >
                                    {isLoadingMore ? (
                                      <div className="inline-flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-t-indigo-600 border-indigo-200 rounded-full animate-spin" />
                                        <span>Loading more...</span>
                                      </div>
                                    ) : (
                                      'Load more transactions'
                                    )}
                                  </button>
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingTransaction(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
