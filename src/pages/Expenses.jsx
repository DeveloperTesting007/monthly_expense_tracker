import React, { useState, useEffect } from 'react';
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
      console.error('Error fetching transactions:', error);
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
      console.error('Error adding transaction:', error);
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
      console.error('Error updating transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
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
      console.error('Error deleting transaction:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLoadMore = () => {
    fetchTransactions(true);
  };

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
            <div className="max-w-3xl mx-auto">
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
              <div className="space-y-6">
                <TransactionForm 
                  onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                  isLoading={isLoading}
                  editData={editingTransaction}
                  onCancel={handleCancelEdit}
                />

                {/* Responsive Transactions Table */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">All Transactions</h3>
                  
                  {/* Desktop Table View */}
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
                          {transactions.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                                No transactions found
                              </td>
                            </tr>
                          ) : (
                            transactions.map((transaction, index) => (
                              <tr key={transaction.id} className="hover:bg-gray-50">
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
                                <td className="px-4 py-3">{transaction.category}</td>
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
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Mobile List View */}
                  <div className="sm:hidden space-y-4">
                    {isLoadingTransactions ? (
                      <div className="py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
                        <p className="mt-2 text-gray-500">Loading transactions...</p>
                      </div>
                    ) : (
                      transactions.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No transactions found</p>
                      ) : (
                        transactions.map((transaction, index) => (
                          <div
                            key={transaction.id}
                            className={`rounded-lg p-4 space-y-3 border
                              ${transaction.type === 'income' 
                                ? 'border-green-100 bg-green-50' 
                                : 'border-red-100 bg-red-50'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="font-medium">{transaction.category}</p>
                                <p className="text-sm text-gray-600">{transaction.description}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs
                                ${transaction.type === 'income' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'}`}
                              >
                                {transaction.type}
                              </span>
                            </div>
                            <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                              <span className="text-xs text-gray-500">
                                {format(new Date(transaction.date), 'MMM dd, yyyy')}
                              </span>
                              <span className={`font-semibold ${
                                transaction.type === 'income' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'}`}
                              >
                                ${transaction.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-end gap-2">
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
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-500">
                                #{index + 1}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs
                                ${transaction.type === 'income' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'}`}
                              >
                                {transaction.type}
                              </span>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>

                  {/* Pagination or Load More */}
                  {!isLoadingTransactions && transactions.length > 0 && (
                    <div className="mt-6 text-center">
                      <div className="flex items-center justify-between px-4">
                        <p className="text-sm text-gray-500">
                          Showing {transactions.length} transactions
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
