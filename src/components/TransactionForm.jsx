import React, { useState, useEffect } from 'react';
import { getCategories } from '../services/categoryService';
import { db } from '../config/firebase';

export default function TransactionForm({ onSubmit, isLoading, editData, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
        setCategoryError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryError('Failed to load categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        type: editData.type,
        categoryId: editData.categoryId,
        amount: editData.amount.toString(),
        description: editData.description,
        date: new Date(editData.date).toISOString().split('T')[0]
      });
    } else {
      resetForm();
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
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
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
      categoryId: formData.categoryId,
      date: formData.date
    });

    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      categoryId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                  categoryId: ''
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="relative">
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={isLoadingCategories}
              className={`
              block w-full rounded-lg border-0 py-3 px-3
              text-gray-900 ring-1 ring-inset
              focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
              appearance-none bg-white
              ${errors.categoryId || categoryError
                  ? 'ring-red-300 focus:ring-red-500'
                  : 'ring-gray-300 focus:ring-blue-500'
                }
              ${isLoadingCategories ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            >
              <option value="">
                {isLoadingCategories
                  ? 'Loading categories...'
                  : categoryError
                    ? 'Error loading categories'
                    : 'Select category'
                }
              </option>
              {!isLoadingCategories && !categoryError && categories[formData.type].map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              {isLoadingCategories ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
          {(errors.categoryId || categoryError) && (
            <p className="mt-2 text-sm text-red-600">{errors.categoryId || categoryError}</p>
          )}
        </div>

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
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
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
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 mt-6">
        {editData && (
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg 
                     font-medium border border-gray-200
                     text-gray-700 hover:text-gray-900 hover:bg-gray-50 
                     transition-all duration-200 hover:border-gray-300 hover:shadow-sm
                     active:bg-gray-100 active:scale-[0.98]
                     disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg 
                     text-white font-medium
                     transition-all duration-200 hover:shadow-md 
                     active:scale-[0.98] disabled:opacity-50
                     flex items-center justify-center gap-2
            ${formData.type === 'income'
              ? 'bg-green-600 hover:bg-green-700 active:bg-green-800'
              : 'bg-red-600 hover:bg-red-700 active:bg-red-800'}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>{editData ? 'Updating...' : 'Adding...'}</span>
            </>
          ) : (
            <>
              {editData ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Transaction</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Transaction</span>
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
