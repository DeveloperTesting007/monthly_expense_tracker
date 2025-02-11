import React from 'react';
import { MdArrowUpward, MdArrowDownward, MdAccountBalance } from 'react-icons/md';

export default function SummaryCards({ transactions, selectedMonth }) {
  const formatMonthYear = (dateString) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const cards = [
    {
      title: 'Total Balance',
      amount: balance,
      icon: <MdAccountBalance size={24} />,
      className: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Income',
      amount: totalIncome,
      icon: <MdArrowUpward size={24} />,
      className: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Expenses',
      amount: totalExpenses,
      icon: <MdArrowDownward size={24} />,
      className: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`bg-gradient-to-r ${card.className} rounded-lg p-3 sm:p-4 lg:p-6 text-white shadow-lg`}
        >
          <div className="flex justify-between items-center mb-2 sm:mb-3 lg:mb-4">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold">
              {card.title}
              {card.title === 'Total Balance' && selectedMonth && (
                <span className="text-xs text-gray-400 ml-1">
                  ({formatMonthYear(selectedMonth)})
                </span>
              )}
            </h3>
            <div className="p-1 sm:p-1.5 lg:p-2 bg-white/20 rounded-lg">
              {card.icon}
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold">${card.amount.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
