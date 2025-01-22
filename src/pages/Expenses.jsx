import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TransactionForm from '../components/TransactionForm';
import { addTransaction, getRecentTransactions } from '../services/transactionService';
import { format } from 'date-fns';

export default function Expenses() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const fetchTransactions = async () => {
    try {
      const recentTransactions = await getRecentTransactions(currentUser.uid);
      setTransactions(recentTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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

  return (
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
              <TransactionForm onSubmit={handleAddTransaction} isLoading={isLoading} />

              {/* Responsive Transactions Table */}
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">All Transactions</h3>
                
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {format(Number(transaction.date), 'MMM dd, yyyy')}
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List View */}
                <div className="sm:hidden space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No transactions found</p>
                  ) : (
                    transactions.map((transaction) => (
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
                            {format(Number(transaction.date), 'MMM dd, yyyy')}
                          </span>
                          <span className={`font-semibold ${
                            transaction.type === 'income' 
                              ? 'text-green-600' 
                              : 'text-red-600'}`}
                          >
                            ${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination or Load More (Optional) */}
                {transactions.length > 0 && (
                  <div className="mt-6 text-center">
                    <button
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      onClick={() => {/* Handle loading more */}}
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
