import React, { useState } from 'react';

export default function TransactionForm({ onSubmit, isLoading }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});

  const categories = {
    expense: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'],
    income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other']
  };

  const validate = () => {
    const newErrors = {};
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      date
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type Selector */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-gray-100 rounded-xl">
          {['expense', 'income'].map((typeOption) => (
            <button
              key={typeOption}
              type="button"
              onClick={() => {
                setType(typeOption);
                setCategory('');
              }}
              className={`
                relative px-6 py-2.5 rounded-lg text-sm font-medium capitalize
                transition-all duration-200 focus:outline-none
                ${type === typeOption
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className={`relative z-10 flex items-center gap-2 ${
                type === typeOption ? 'text-white' : ''
              }`}>
                {typeOption === 'income' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                )}
                {typeOption}
              </span>
              {type === typeOption && (
                <div className={`
                  absolute inset-0 rounded-lg transition-all duration-200
                  ${typeOption === 'income' ? 'bg-green-600' : 'bg-red-600'}
                `} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Amount and Date Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative mt-1 rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`
                block w-full rounded-lg border-0 py-3 pl-7 pr-3
                text-gray-900 ring-1 ring-inset placeholder:text-gray-400
                focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                ${errors.amount
                  ? 'ring-red-300 focus:ring-red-500'
                  : 'ring-gray-300 focus:ring-blue-500'
                }
              `}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          {errors.amount && (
            <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`
              block w-full rounded-lg border-0 py-3 px-3
              text-gray-900 ring-1 ring-inset
              focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
              ${errors.date
                ? 'ring-red-300 focus:ring-red-500'
                : 'ring-gray-300 focus:ring-blue-500'
              }
            `}
          />
          {errors.date && (
            <p className="mt-2 text-sm text-red-600">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`
            block w-full rounded-lg border-0 py-3 px-3
            text-gray-900 ring-1 ring-inset placeholder:text-gray-400
            focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
            ${errors.description
              ? 'ring-red-300 focus:ring-red-500'
              : 'ring-gray-300 focus:ring-blue-500'
            }
          `}
          placeholder="Enter description"
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Category Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`
              block w-full rounded-lg border-0 py-3 px-3
              text-gray-900 ring-1 ring-inset
              focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
              appearance-none bg-white
              ${errors.category
                ? 'ring-red-300 focus:ring-red-500'
                : 'ring-gray-300 focus:ring-blue-500'
              }
            `}
          >
            <option value="">Select category</option>
            {categories[type].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.category && (
          <p className="mt-2 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`
            px-6 py-3 rounded-lg text-white font-medium
            transition-all duration-200 transform hover:scale-[1.02]
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : type === 'expense'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
