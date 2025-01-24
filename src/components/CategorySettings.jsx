import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageProvider';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { MdAdd, MdEdit, MdDelete, MdFilterList } from 'react-icons/md';

export default function CategorySettings({ showOnlyForm, showOnlyList }) {
    // State management
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({ 
        name: '', 
        type: 'expense',
        status: 'active' // Add status to initial state
    });
    const { currentUser } = useAuth();
    const { showMessage } = useMessage();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [inlineEditingId, setInlineEditingId] = useState(null);
    const [inlineEditData, setInlineEditData] = useState(null);

    // Load categories on component mount
    useEffect(() => {
        loadCategories();
    }, [currentUser]);

    const loadCategories = async () => {
        if (!currentUser) return;
        
        try {
            const fetchedCategories = await getCategories(currentUser.uid);
            setCategories(fetchedCategories);
        } catch (error) {
            showMessage('Failed to load categories', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter categories
    const filteredCategories = categories.filter(category => {
        const matchesFilter = filter === 'all' || category.type === filter;
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Inline editing functions
    const startInlineEdit = (category) => {
        setInlineEditingId(category.id);
        setInlineEditData({ ...category });
    };

    const cancelInlineEdit = () => {
        setInlineEditingId(null);
        setInlineEditData(null);
    };

    const saveInlineEdit = async () => {
        if (!inlineEditData?.name?.trim()) {
            showMessage('Category name is required', 'error');
            return;
        }

        try {
            await updateCategory(inlineEditingId, {
                ...inlineEditData,
                updatedAt: new Date()
            });
            showMessage('Category updated successfully', 'success');
            loadCategories();
            cancelInlineEdit();
        } catch (error) {
            showMessage('Failed to update category', 'error');
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newCategory.name?.trim()) {
            showMessage('Category name is required', 'error');
            return;
        }

        try {
            await addCategory(currentUser.uid, newCategory);
            showMessage('Category added successfully', 'success');
            setNewCategory({ name: '', type: 'expense', active: true });
            loadCategories();
        } catch (error) {
            showMessage('Failed to add category', 'error');
        }
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        if (editingCategory) {
            setEditingCategory(prev => ({
                ...prev,
                [field]: value,
                updatedAt: new Date()
            }));
        } else {
            setNewCategory(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleDelete = async (categoryId, categoryName) => {
        try {
            // Show confirmation dialog with category name
            const isConfirmed = window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`);
            
            if (isConfirmed) {
                setIsLoading(true);
                await deleteCategory(categoryId);
                showMessage('Category deleted successfully', 'success');
                loadCategories();
            }
        } catch (error) {
            showMessage('Failed to delete category', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (category) => {
        // Clear any existing edit state
        setInlineEditingId(null);
        setInlineEditData(null);
        
        // Set new editing category
        setEditingCategory({
            ...category,
            name: category.name.trim(),
            type: category.type.toLowerCase(),
            status: category.status || 'active'
        });

        // Scroll to form when editing
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editingCategory?.name?.trim()) {
            showMessage('Category name is required', 'error');
            return;
        }

        try {
            setIsLoading(true);
            await updateCategory(editingCategory.id, {
                ...editingCategory,
                name: editingCategory.name.trim(),
                type: editingCategory.type.toLowerCase(),
                status: editingCategory.status,
                updatedAt: new Date()
            });
            showMessage('Category updated successfully', 'success');
            setEditingCategory(null);
            await loadCategories();
        } catch (error) {
            showMessage('Failed to update category', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Form Component
    const CategoryForm = () => (
        <form onSubmit={editingCategory ? handleUpdateCategory : handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <select
                        value={editingCategory?.type || newCategory.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Category Name</label>
                    <input
                        type="text"
                        placeholder="Enter category name"
                        value={editingCategory?.name || newCategory.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                        value={editingCategory?.status || newCategory.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-between pt-4">
                <div>
                    {editingCategory && (
                        <span className="text-sm text-gray-500">
                            Editing: {editingCategory.name}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {editingCategory && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingCategory(null);
                                setInlineEditingId(null);
                                setInlineEditData(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium 
                                text-gray-700 hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium 
                            hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : editingCategory ? 'Update Category' : 'Add Category'}
                    </button>
                </div>
            </div>
        </form>
    );

    // Table Component
    const CategoryTable = () => (
        <div className="overflow-x-auto">
            <div className="divide-y divide-gray-200">
                {/* Filters Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-4 justify-between">
                        <div className="flex items-center gap-4">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="all">All Categories</option>
                                <option value="expense">Expenses</option>
                                <option value="income">Income</option>
                            </select>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg"
                                />
                                <MdFilterList className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {category.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${category.status === 'active' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-gray-100 text-gray-800'}`}
                                        >
                                            {category.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(category.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                disabled={isLoading || editingCategory !== null}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full 
                                                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={editingCategory ? "Finish current edit first" : "Edit Category"}
                                            >
                                                <MdEdit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
                                                disabled={isLoading || editingCategory !== null}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full 
                                                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={editingCategory ? "Finish current edit first" : "Delete Category"}
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <MdFilterList size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                            <p className="text-gray-500">
                                {searchTerm
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Add your first category using the form above'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Main render
    return (
        <div className="divide-y divide-gray-200">
            {showOnlyForm && <CategoryForm />}
            {showOnlyList && <CategoryTable />}
            {!showOnlyForm && !showOnlyList && (
                <>
                    <div className="p-6">
                        <CategoryForm />
                    </div>
                    <CategoryTable />
                </>
            )}
        </div>
    );
}
