import React from 'react';
import { format } from 'date-fns';

export default function RecentTransactions({ transactions }) {
    const formatTransactionDate = (timestamp) => {
        try {
            if (!timestamp) return 'N/A';
            const dateNumber = Number(timestamp);
            if (isNaN(dateNumber)) return 'Invalid date';
            return format(dateNumber, 'MMM dd, yyyy');
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid date';
        }
    };

    const sortedTransactions = React.useMemo(() => 
        [...transactions].sort((a, b) => b.date - a.date),
        [transactions]
    );

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-800">Recent Transactions</h3>
            {sortedTransactions.length === 0 ? (
                <p className="text-sm sm:text-base text-center text-gray-500 py-4">No transactions yet</p>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {sortedTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className={`flex justify-between items-center p-3 sm:p-4 rounded-lg border
                ${transaction.type === 'income'
                                    ? 'border-green-100 bg-green-50'
                                    : 'border-red-100 bg-red-50'} 
                hover:shadow-md transition-shadow duration-200`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span className={`text-base sm:text-lg ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}
                                    </span>
                                    <div>
                                        <p className="text-sm sm:text-base font-medium text-gray-800">{transaction.category}</p>
                                        <p className="text-xs sm:text-sm text-gray-600">{transaction.description}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                    {formatTransactionDate(transaction.date)}
                                </p>
                            </div>
                            <p className={`font-semibold text-base sm:text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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
