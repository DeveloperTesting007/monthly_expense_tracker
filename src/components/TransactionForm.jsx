import React, { useState, useEffect } from 'react';

export default function TransactionForm({ onSubmit, isLoading, editData, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  const categories = {
    expense: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'],
    income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other']
  };

  useEffect(() => {
    if (editData) {
      setFormData({
        type: editData.type,
        category: editData.category,
        amount: editData.amount.toString(),
        description: editData.description,
        date: new Date(editData.date).toISOString().split('T')[0]
      });
    }
  }, [editData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category: formData.category,
      date: formData.date
    });

    // Reset form
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">
        {editData ? 'Edit Transaction' : 'Add New Transaction'}
      </h3>

      {/* Transaction Type Selector */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-gray-100 rounded-xl">
          {['expense', 'income'].map((typeOption) => (
            <button
              key={typeOption}
              type="button"
              onClick={() => {
                setFormData((prevData) => ({
                  ...prevData,
                  type: typeOption,
                  category: ''
                }));
              }}
              className={`
                relative px-6 py-2.5 rounded-lg text-sm font-medium capitalize
                transition-all duration-200 focus:outline-none
                ${formData.type === typeOption
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className={`relative z-10 flex items-center gap-2 ${formData.type === typeOption ? 'text-white' : ''
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
              {formData.type === typeOption && (
                <div className={`
                  absolute inset-0 rounded-lg transition-all duration-200
                  ${typeOption === 'income' ? 'bg-green-600' : 'bg-red-600'}
                `} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="relative">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
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
            {categories[formData.type].map((cat) => (
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
              name="amount"
              value={formData.amount}
              onChange={handleChange}
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
            name="date"
            value={formData.date}
            onChange={handleChange}
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
          name="description"
          value={formData.description}
          onChange={handleChange}
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

      {/* Submit Button */}
      <div className="flex justify-end space-x-4 mt-6">
        {editData && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : editData ? 'Update' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
