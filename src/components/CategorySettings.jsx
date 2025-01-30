import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageProvider';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/categoryService';
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
    showOnlyForm, 
    showOnlyList, 
    onSuccess,
    editingCategory,
    onCancelEdit,
    // ...other props
}) {
    // Add error state
    const [error, setError] = useState(null);

    // Organized state management
    const [state, setState] = useState({
        categories: [], // Change to array
        isLoading: true,
        isSubmitting: false,
        filter: 'all',
        searchTerm: '',
        showMobileFilters: false,
    });

    const [formState, setFormState] = useState({
        editingCategory: null,
        newCategory: { ...INITIAL_CATEGORY },
        inlineEditingId: null,
        inlineEditData: null,
    });

    const { currentUser } = useAuth();
    const { showMessage } = useMessage();

    // Memoized filtered categories
    const filteredCategories = useMemo(() => {
        return state.categories.filter(category => {
            const matchesFilter = state.filter === 'all' || category.type === state.filter;
            const matchesSearch = category.name.toLowerCase().includes(state.searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [state.categories, state.filter, state.searchTerm]);

    // Load categories with error handling
    const loadCategories = useCallback(async () => {
        if (!currentUser) return;

        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const categoriesData = await getCategories();

            // Convert categories object to array
            const categoriesArray = Object.entries(categoriesData).reduce((acc, [type, categories]) => {
                return [...acc, ...categories.map(cat => ({
                    ...cat,
                    type // Ensure type is included
                }))];
            }, []);

            setState(prev => ({
                ...prev,
                categories: categoriesArray,
                isLoading: false
            }));
            setError(null);
        } catch (error) {
            const message = error.response?.data?.message || ERROR_MESSAGES.LOAD_ERROR;
            showMessage(message, 'error');
            setError(message);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [currentUser, showMessage]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Optimized form handlers
    const handleFormChange = useCallback((field, value) => {
        setFormState(prev => ({
            ...prev,
            newCategory: {
                ...prev.newCategory,
                [field]: value
            }
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormState(prev => ({
            ...prev,
            newCategory: { ...INITIAL_CATEGORY },
            editingCategory: null,
            inlineEditingId: null,
            inlineEditData: null
        }));
    }, []);

    // Enhanced submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formState.editingCategory) {
            await handleUpdate(e);
        } else {
            setState(prev => ({ ...prev, isSubmitting: true }));

            try {
                const categoryData = {
                    ...formState.newCategory,
                    name: formState.newCategory.name.trim(),
                    type: formState.newCategory.type.toLowerCase(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await addCategory(currentUser.uid, categoryData);
                showMessage('Category added successfully', 'success');
                resetForm();
                await loadCategories();
            } catch (error) {
                showMessage('Failed to add category', 'error');
            } finally {
                setState(prev => ({ ...prev, isSubmitting: false }));
            }
        }
    };

    // Add new handler for category submission
    const handleAddCategory = async (categoryData) => {
        if (!categoryData.name?.trim()) {
            showMessage(ERROR_MESSAGES.NAME_REQUIRED, 'error');
            return;
        }

        // Check if category name already exists (but ignore current category when editing)
        const nameExists = state.categories.some(
            cat => cat.id !== categoryData.id && // Skip current category when editing
                cat.name.toLowerCase() === categoryData.name.trim().toLowerCase() &&
                cat.type.toLowerCase() === categoryData.type.trim().toLowerCase()
        );

        if (nameExists) {
            showMessage(ERROR_MESSAGES.NAME_EXISTS, 'error');
            return;
        }

        setState(prev => ({ ...prev, isSubmitting: true }));
        setError(null);

        try {
            if (categoryData.id) {
                // Update existing category
                await updateCategory(categoryData.id, {
                    ...categoryData,
                    updatedAt: new Date()
                });
                showMessage('Category updated successfully', 'success');
            } else {
                // Add new category
                await addCategory(currentUser.uid, {
                    ...categoryData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                showMessage('Category added successfully', 'success');
            }

            await loadCategories();
            if (onSuccess) onSuccess();
        } catch (error) {
            const message = error.response?.data?.message || 
                (categoryData.id ? ERROR_MESSAGES.UPDATE_ERROR : ERROR_MESSAGES.ADD_ERROR);
            showMessage(message, 'error');
            setError(message);
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    // Add new handler for filter changes
    const handleFilterChange = useCallback((field, value) => {
        setState(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Add handleEdit function
    const handleEdit = useCallback((category) => {
        // Reset any existing edit states
        setFormState(prev => ({
            ...prev,
            editingCategory: {
                ...category,
                name: category.name.trim(),
                type: category.type.toLowerCase(),
                status: category.status || 'active'
            },
            inlineEditingId: null,
            inlineEditData: null
        }));

        // Show success message
        showMessage('Category ready for editing', 'info');

        // Scroll to form if not in view
        if (!showOnlyList) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [showMessage, showOnlyList]);

    // Add handleUpdate function
    const handleUpdate = async (e) => {
        e.preventDefault();
        const { editingCategory } = formState;

        if (!editingCategory?.name?.trim()) {
            showMessage(ERROR_MESSAGES.NAME_REQUIRED, 'error');
            return;
        }

        // Check if updated name conflicts with existing categories
        const nameExists = state.categories.some(
            cat => cat.id !== editingCategory.id &&
                cat.name.toLowerCase() === editingCategory.name.trim().toLowerCase()
        );
        if (nameExists) {
            showMessage(ERROR_MESSAGES.NAME_EXISTS, 'error');
            return;
        }

        setState(prev => ({ ...prev, isSubmitting: true }));
        setError(null);

        try {
            await updateCategory(editingCategory.id, {
                ...editingCategory,
                name: editingCategory.name.trim(),
                type: editingCategory.type.toLowerCase(),
                updatedAt: new Date()
            });
            showMessage('Category updated successfully', 'success');
            resetForm();
            await loadCategories();
        } catch (error) {
            const message = error.response?.data?.message || ERROR_MESSAGES.UPDATE_ERROR;
            showMessage(message, 'error');
            setError(message);
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    // Enhanced delete handler with better error handling
    const handleDelete = async (categoryId, categoryName) => {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
        );

        if (!isConfirmed) return;

        setState(prev => ({ ...prev, isLoading: true }));
        setError(null);

        try {
            await deleteCategory(categoryId);
            showMessage('Category deleted successfully', 'success');
            await loadCategories();
        } catch (error) {
            const message = error.response?.data?.message || ERROR_MESSAGES.DELETE_ERROR;
            showMessage(message, 'error');
            setError(message);
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const validateCategory = useCallback((category) => {
        if (!category.name?.trim()) {
            throw new Error('Category name is required');
        }
        if (category.name.length < 2) {
            throw new Error('Category name must be at least 2 characters');
        }
        if (!['expense', 'income'].includes(category.type)) {
            throw new Error('Invalid category type');
        }
        return true;
    }, []);

    const handleCategoryAction = async (action, categoryData) => {
        try {
            validateCategory(categoryData);
            setState(prev => ({ ...prev, isSubmitting: true }));

            switch (action) {
                case 'add':
                    await addCategory(currentUser.uid, categoryData);
                    showMessage('Category added successfully', 'success');
                    break;
                case 'update':
                    await updateCategory(categoryData.id, categoryData);
                    showMessage('Category updated successfully', 'success');
                    break;
                case 'delete':
                    await deleteCategory(categoryData.id);
                    showMessage('Category deleted successfully', 'success');
                    break;
                default:
                    throw new Error('Invalid action');
            }

            if (onSuccess) onSuccess();
            resetForm();
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    // Components
    const LoadingSpinner = () => (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="text-sm text-gray-500">Loading categories...</p>
        </div>
    );

    const CategoryForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type field */}
                <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <select
                        value={formState.newCategory.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                        disabled={state.isSubmitting}
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>

                {/* Name field */}
                <div>
                    <label className="text-sm font-medium text-gray-700">Category Name</label>
                    <input
                        type="text"
                        placeholder="Enter category name"
                        value={formState.newCategory.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                        disabled={state.isSubmitting}
                        required
                    />
                </div>

                {/* Status field */}
                <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                        value={formState.newCategory.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                        disabled={state.isSubmitting}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={state.isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium 
                        hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {state.isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                            <span>Adding...</span>
                        </>
                    ) : (
                        <span>Add Category</span>
                    )}
                </button>
            </div>
        </form>
    );

    const CategoryTable = () => (
        <div className="overflow-hidden">
            {/* Mobile Filters */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">List of Categories</h3>
                        <button
                            onClick={() => setState(prev => ({ ...prev, showMobileFilters: !prev.showMobileFilters }))}
                            className="sm:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <MdFilterList className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Mobile Filter Panel */}
                    <div className={`sm:hidden space-y-4 ${state.showMobileFilters ? 'block' : 'hidden'}`}>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={state.searchTerm}
                                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg
                                         text-base placeholder:text-gray-400
                                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <MdFilterList className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                        </div>

                        <select
                            value={state.filter}
                            onChange={(e) => handleFilterChange('filter', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg 
                                     bg-white text-base"
                        >
                            <option value="all">All Categories</option>
                            <option value="expense">Expenses</option>
                            <option value="income">Income</option>
                        </select>

                        {/* Active Filters */}
                        {(state.filter !== 'all' || state.searchTerm) && (
                            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                                {state.filter !== 'all' && (
                                    <span className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg">
                                        {toTitleCase(state.filter)}
                                    </span>
                                )}
                                {state.searchTerm && (
                                    <span className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg">
                                        Search: {state.searchTerm}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Category List */}
            <div className="block sm:hidden">
                {state.isLoading ? (
                    <LoadingSpinner />
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <MdFilterList className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-sm font-medium text-gray-900">No categories found</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            {state.searchTerm ? 'Try adjusting your search or filters' : 'Add your first category'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredCategories.map((category, index) => (
                            <div key={category.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500">#{index + 1}</span>
                                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            disabled={state.isLoading || formState.editingCategory}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg 
                                                     transition-colors disabled:opacity-50"
                                            aria-label="Edit category"
                                        >
                                            <MdEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id, category.name)}
                                            disabled={state.isLoading || formState.editingCategory}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg 
                                                     transition-colors disabled:opacity-50"
                                            aria-label="Delete category"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-lg
                                        ${category.type === 'income' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'}`}
                                    >
                                        {toTitleCase(category.type)}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-lg
                                        ${category.status === 'active'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {toTitleCase(category.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategories.map((category, index) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-500 w-16">
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {toTitleCase(category.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${category.status === 'active'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {toTitleCase(category.status)}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center justify-center space-x-3">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            disabled={state.isLoading || formState.editingCategory !== null}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full 
                                                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={formState.editingCategory ? "Finish current edit first" : "Edit Category"}
                                        >
                                            <MdEdit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id, category.name)}
                                            disabled={state.isLoading || formState.editingCategory !== null}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full 
                                                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={formState.editingCategory ? "Finish current edit first" : "Delete Category"}
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State - Update for better mobile display */}
            {!state.isLoading && filteredCategories.length === 0 && (
                <div className="text-center py-12 px-4">
                    <div className="text-gray-400 mb-4">
                        <MdFilterList size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-500 text-sm">
                        {state.searchTerm
                            ? 'Try adjusting your search or filter criteria'
                            : 'Add your first category using the form above'}
                    </p>
                </div>
            )}

            {/* Loading State */}
            {state.isLoading && <LoadingSpinner />}
        </div>
    );

    // Add error display component
    const ErrorMessage = ({ message }) => message ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-medium">Error: </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    ) : null;

    // Main render without error boundary
    return (
        <div className="divide-y divide-gray-200">
            {error && <ErrorMessage message={error} />}
            {state.isLoading && !showOnlyForm ? (
                <LoadingSpinner />
            ) : (
                <>
                    {(showOnlyForm || !showOnlyList) && (
                        <div className="p-6">
                            <AddCategoryForm
                                onSubmit={handleAddCategory}
                                disabled={state.isLoading}
                                isSubmitting={state.isSubmitting}
                                editingCategory={editingCategory}
                                onCancelEdit={onCancelEdit}
                            />
                        </div>
                    )}
                    {(showOnlyList || !showOnlyForm) && <CategoryTable />}
                </>
            )}
        </div>
    );
}
