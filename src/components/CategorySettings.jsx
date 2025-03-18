import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageProvider';
import * as categoryService from '../services/categoryService';
import { MdAdd, MdEdit, MdDelete, MdFilterList } from 'react-icons/md';

// Type definitions
const INITIAL_CATEGORY = {
    name: '',
    type: 'expense',
    status: 'active'
};

// Add error message constants
const ERROR_MESSAGES = {
    NAME_REQUIRED: 'Category name is required',
    NAME_TOO_SHORT: 'Category name must be at least 2 characters',
    NAME_EXISTS: 'A category with this name already exists',
    LOAD_ERROR: 'Failed to load categories',
    ADD_ERROR: 'Failed to add category',
    UPDATE_ERROR: 'Failed to update category',
    DELETE_ERROR: 'Failed to delete category',
    NETWORK_ERROR: 'Network error. Please check your connection',
};

// Add this utility function near the top with other constants
const toTitleCase = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Updated Add Category Form
const AddCategoryForm = ({ onSubmit, disabled, isSubmitting, editingCategory, onCancelEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        status: 'active'
    });

    // Initialize form with editing data
    useEffect(() => {
        if (editingCategory) {
            setFormData({
                name: editingCategory.name,
                type: editingCategory.type,
                status: editingCategory.status || 'active'
            });
        } else {
            setFormData({
                name: '',
                type: 'expense',
                status: 'active'
            });
        }
    }, [editingCategory]);

    const [touched, setTouched] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
    };

    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim().length < 2) {
            return;
        }
        const submitData = {
            ...formData,
            id: editingCategory?.id,
            name: formData.name.trim(),
            type: formData.type.toLowerCase(),
            status: formData.status,
            updatedAt: new Date()
        };

        onSubmit(submitData);

        if (!editingCategory) {
            setFormData({ name: '', type: 'expense', status: 'active' });
        }
    };

    const isNameValid = formData.name.trim().length >= 2;
    const showNameError = touched.name && !isNameValid;

    return (
        <div className="bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
                {editingCategory && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Category ID
                        </label>
                        <input
                            type="text"
                            value={editingCategory.category_id || ''}
                            disabled
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500">Category ID cannot be changed</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            disabled={disabled}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                                text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                placeholder="Enter category name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                onBlur={() => handleBlur('name')}
                                disabled={disabled}
                                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm text-sm
                                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                                    disabled:bg-gray-50 disabled:text-gray-500 transition-colors
                                    ${showNameError ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                                    ${!showNameError && formData.name.length >= 2 ? 'border-green-300 bg-green-50' : ''}`}
                            />
                            {showNameError && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {showNameError && (
                            <p className="mt-1 text-sm text-red-600">
                                Name must be at least 2 characters
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            disabled={disabled}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                                text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                                disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    {editingCategory && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
                                border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={disabled || isSubmitting || !isNameValid}
                        className="inline-flex items-center px-4 py-2 border border-transparent 
                            rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 
                            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                            focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                        stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {editingCategory ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            editingCategory ? 'Update Category' : 'Create Category'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default function CategorySettings({
    categories,
    isLoading,
    onEdit,
    onDelete,
    searchTerm,
    filterType,
    currentUser
}) {
    const [editingId, setEditingId] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    const handleEdit = (category) => {
        setEditingId(category.id);
        onEdit(category);
    };

    const handleDeleteClick = (category) => {
        if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
            onDelete(category.id, category.category_id);
        }
    };

    // Filter categories based on search and filter type
    const filteredCategories = useMemo(() => {
        const allCategories = [...categories.expense, ...categories.income];
        return allCategories.filter(category => {
            const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || category.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [categories, searchTerm, filterType]);

    return (
        <div className="overflow-x-auto">
            {isLoading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategories.map(category => (
                            <tr
                                key={category.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {category.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${category.type === 'expense'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}
                                    >
                                        {toTitleCase(category.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${category.status === 'active'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {toTitleCase(category.status || 'active')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <MdEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(category)}
                                            disabled={isLoading}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        >
                                            <MdDelete className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredCategories.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No categories found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
