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
    searchQuery: ''
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.category !== 'all' && transaction.category !== filters.category) return false;
    if (filters.searchQuery && !transaction.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const transactionDate = new Date(transaction.date);
      const diffTime = Math.abs(today - transactionDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'year': return diffDays <= 365;
        default: return true;
      }
    }
    
    return true;
  });

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
              <div className={`p-2 rounded-xl ${
                isIncome ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <svg className={`w-5 h-5 ${
                  isIncome ? 'text-green-600' : 'text-red-600'
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
            <span className={`text-lg font-semibold tabular-nums ${
              isIncome ? 'text-green-600' : 'text-red-600'
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
          {transaction.type}
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
              <div className="flex justify-between items-center mb-6">
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <div className="flex-1 ml-4 lg:ml-0">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Manage Expenses</h1>
                  <p className="text-sm lg:text-base text-gray-600">Add and view your transactions</p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-8">
                {/* New Transaction Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Card Header */}
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

                  {/* Form Content */}
                  <div className="p-6">
                    <TransactionForm 
                      onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                      isLoading={isLoading}
                      editData={editingTransaction}
                      onCancel={handleCancelEdit}
                    />
                  </div>
                </div>

                {/* Responsive Transactions Table */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold">All Transactions</h3>
                      
                      {/* Mobile Filter Toggle */}
                      <button
                        className="sm:hidden px-3 py-2 text-sm text-gray-600 border border-gray-200 
                                 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setShowMobileFilters(prev => !prev)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                      </button>
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden sm:flex flex-wrap items-center gap-3">
                      {/* Search Input */}
                      <div className="relative flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={filters.searchQuery}
                          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 
                                  focus:ring-indigo-500 focus:border-transparent"
                        />
                        <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm min-w-[120px]"
                      >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>

                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm min-w-[150px]"
                      >
                        <option key="all-categories" value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={`category-${category}`} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>

                      <select
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm min-w-[120px]"
                      >
                        <option value="all">All Time</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="year">Last Year</option>
                      </select>
                    </div>

                    {/* Mobile Filters */}
                    <div className={`sm:hidden space-y-3 ${showMobileFilters ? 'block' : 'hidden'}`}>
                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={filters.searchQuery}
                          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <svg className="absolute right-3 top-3 h-5 w-5 text-gray-400" 
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* Filter Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={filters.type}
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 
                                   bg-white text-sm appearance-none"
                        >
                          <option value="all">All Types</option>
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>

                        <select
                          value={filters.dateRange}
                          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 
                                   bg-white text-sm appearance-none"
                        >
                          <option value="all">All Time</option>
                          <option value="week">Last Week</option>
                          <option value="month">Last Month</option>
                          <option value="year">Last Year</option>
                        </select>
                      </div>

                      {/* Category Select */}
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 
                                 bg-white text-sm appearance-none"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={`category-${category}`} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mobile Transaction List */}
                  <div className="sm:hidden">
                    {isLoadingTransactions ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="inline-flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-t-indigo-600 border-indigo-200 
                                        rounded-full animate-spin" />
                          <span className="text-sm text-gray-500">Loading transactions...</span>
                        </div>
                      </div>
                    ) : filteredTransactions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="inline-flex h-16 w-16 items-center justify-center 
                                      rounded-full bg-gray-100">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" 
                               viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-sm font-medium text-gray-900">No transactions found</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Try adjusting your filters or add a new transaction
                        </p>
                      </div>
                    ) : 
                    (
                      <>
                        <div className="space-y-3">
                          {filteredTransactions.map((transaction, index) => 
                            renderMobileTransactionCard(transaction, index)
                          )}
                        </div>
                        
                        {/* Show results count */}
                        {/* <div className="mt-4 text-center text-sm text-gray-500">
                          Showing {filteredTransactions.length} of {transactions.length} transactions
                        </div> */}
                      </>
                    )
                    }

                    {/* Mobile Load More */}
                    {/* {!isLoadingTransactions && filteredTransactions.length > 0 && hasMore && (
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="mt-6 w-full py-3 px-4 text-sm font-medium text-indigo-600 
                                 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors
                                 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoadingMore ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent 
                                          rounded-full animate-spin" />
                            <span>Loading more...</span>
                          </>
                        ) : (
                          <>
                            <span>Show More</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" 
                                 viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    )} */}
                  </div>

                  {/* Use filteredTransactions instead of transactions */}
                  <div className="hidden sm:block overflow-x-auto">
                    {isLoadingTransactions ? (
                      <div className="py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
                        <p className="mt-2 text-gray-500">Loading transactions...</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-3">No</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredTransactions.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                                No transactions found
                              </td>
                            </tr>
                          ) : (
                            filteredTransactions.map((transaction, index) => (
                              renderTransactionRow(transaction, index)
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Pagination or Load More */}
                  {!isLoadingTransactions && filteredTransactions.length > 0 && (
                    <div className="mt-6 text-center">
                      <div className="flex items-center justify-between px-4">
                        <p className="text-sm text-gray-500">
                          Showing {filteredTransactions.length} of {transactions.length} transactions
                        </p>
                        {hasMore && (
                          <button
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 flex items-center gap-2"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                          >
                            {isLoadingMore ? (
                              <>
                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                Loading...
                              </>
                            ) : (
                              'Load More'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
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
