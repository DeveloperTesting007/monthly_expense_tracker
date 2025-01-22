import React from 'react';
import { MdArrowUpward, MdArrowDownward, MdAccountBalance } from 'react-icons/md';

export default function SummaryCards({ transactions }) {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`bg-gradient-to-r ${card.className} rounded-lg p-6 text-white shadow-lg`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <div className="p-2 bg-white/20 rounded-lg">
              {card.icon}
            </div>
          </div>
          <p className="text-2xl font-bold">${card.amount.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
