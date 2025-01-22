import React from 'react';
import { format } from 'date-fns';

export default function RecentTransactions({ transactions }) {
    const formatTransactionDate = (timestamp) => {
        try {
            if (!timestamp) return 'No date';
            // Ensure we're working with a number
            const dateNumber = typeof timestamp === 'number' ? timestamp : Number(timestamp);
            if (isNaN(dateNumber)) return 'Invalid date';
            return format(dateNumber, 'MMM dd, yyyy');
        } catch (error) {
            console.error('Date formatting error:', error, timestamp);
            return 'Invalid date';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Recent Transactions</h3>
            {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No transactions yet</p>
            ) : (
                <div className="space-y-4">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className={`flex justify-between items-center p-4 rounded-lg border
                ${transaction.type === 'income'
                                    ? 'border-green-100 bg-green-50'
                                    : 'border-red-100 bg-red-50'} 
                hover:shadow-md transition-shadow duration-200`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}
                                    </span>
                                    <div>
                                        <p className="font-medium text-gray-800">{transaction.category}</p>
                                        <p className="text-sm text-gray-600">{transaction.description}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatTransactionDate(transaction.date)}
                                </p>
                            </div>
                            <p className={`font-semibold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                ${transaction.amount.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
