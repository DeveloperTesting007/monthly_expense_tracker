import React, { useState } from 'react';
import { format } from 'date-fns';

// Loading skeleton component
const TransactionSkeleton = () => (
  <div className="animate-pulse">
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export default function RecentTransactions({ transactions, isLoading }) {
  const [expandedId, setExpandedId] = useState(null);

  const getCategoryInfo = (transaction) => {
    if (transaction.categoryName) {
      return transaction.categoryName;
    }
    if (transaction.category?.name) {
      return transaction.category.name;
    }
    return 'Unknown Category';
  };

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-200 bg-white rounded-lg">
        {[...Array(5)].map((_, index) => (
          <TransactionSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  const toggleTransaction = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ul className="divide-y divide-gray-200">
      {transactions.map((transaction) => (
        <li key={transaction.id} className="overflow-hidden">
          {/* Transaction Summary */}
          <div
            onClick={() => toggleTransaction(transaction.id)}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                transaction.type === 'income' 
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {transaction.type === 'income' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                  {` • ${getCategoryInfo(transaction)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-right ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                <p className="font-medium">
                  {transaction.type === 'income' ? '+' : '-'}
                  ${transaction.amount.toFixed(2)}
                </p>
              </div>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  expandedId === transaction.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Collapsible Details */}
          <div
            className={`
              transition-all duration-200 ease-in-out bg-gray-50
              ${expandedId === transaction.id ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="px-4 py-3 space-y-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-base text-gray-900 capitalize">{transaction.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-base text-gray-900">{getCategoryInfo(transaction)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-base text-gray-900">{transaction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base text-gray-900">
                    {format(new Date(transaction.date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className={`text-base font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    ${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
