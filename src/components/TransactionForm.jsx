import React, { useState } from 'react';
import { categories } from '../services/transactionService';
import { format } from 'date-fns';

export default function TransactionForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'), // Add default date
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create a date at noon to avoid timezone issues
    const selectedDate = new Date(formData.date);
    selectedDate.setHours(12, 0, 0, 0);
    
    await onSubmit({
      ...formData,
      amount: Number(formData.amount),
      date: selectedDate.getTime(), // Send as timestamp number
    });
    
    setFormData({ 
      type: 'expense', 
      amount: '', 
      category: '', 
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Add Transaction</h3>
      <div className="grid gap-5">
        <div className="flex gap-4">
          <label className="flex items-center hover:cursor-pointer">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mr-2 text-red-500 focus:ring-red-400"
            />
            <span className="text-gray-700">Expense</span>
          </label>
          <label className="flex items-center hover:cursor-pointer">
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mr-2 text-green-500 focus:ring-green-400"
            />
            <span className="text-gray-700">Income</span>
          </label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 
              focus:border-transparent outline-none transition-all duration-200"
            required
          />
          
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 
              focus:border-transparent outline-none transition-all duration-200"
            required
          />
        </div>
        
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 
            focus:border-transparent outline-none transition-all duration-200"
          required
        >
          <option value="">Select Category</option>
          {categories[formData.type].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 
            focus:border-transparent outline-none transition-all duration-200"
          required
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className={`py-3 px-4 rounded-lg text-white font-medium transition-all duration-200
            ${formData.type === 'income' 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Adding...' : `Add ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
        </button>
      </div>
    </form>
  );
}
