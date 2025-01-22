import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TransactionForm from '../components/TransactionForm';
import RecentTransactions from '../components/RecentTransactions';
import SummaryCards from '../components/SummaryCards';
import { addTransaction, getRecentTransactions } from '../services/transactionService';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [currentUser]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const fetchTransactions = async () => {
    try {
      setError(null);
      const recentTransactions = await getRecentTransactions(currentUser.uid);
      setTransactions(recentTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
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

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden ${
          isMobileMenuOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
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
            {/* Mobile Header with Menu Button */}
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Welcome Back!</h1>
                <p className="text-sm lg:text-base text-gray-600">Here's your financial overview</p>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 lg:px-4 lg:py-2 bg-red-600 text-white text-sm lg:text-base 
                  rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>

            {/* Summary Cards */}
            <div className="mb-6">
              <SummaryCards transactions={transactions} />
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {error && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-1">
                      <p className="text-sm text-yellow-700">{error}</p>
                    </div>
                    <button 
                      onClick={() => setError(null)}
                      className="text-yellow-700"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <TransactionForm onSubmit={handleAddTransaction} isLoading={isLoading} />
              <RecentTransactions transactions={transactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
