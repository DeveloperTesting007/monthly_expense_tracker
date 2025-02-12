import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageProvider';
import * as categoryService from '../services/categoryService';
import Sidebar from '../components/Sidebar';
import CategorySettings from '../components/CategorySettings';
import CategoryForm from '../components/forms/CategoryForm'; // Add this import
import { MdMenu, MdCategory, MdRefresh, MdSearch, MdFilterList } from 'react-icons/md';
import AddCategoryFAB from '../components/AddCategoryFAB';

export default function Categories() {
    const { currentUser } = useAuth();
    const { showMessage } = useMessage();

    // Add categories state
    const [categories, setCategories] = useState({ expense: [], income: [] });
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const loadCategories = async () => {
        if (!currentUser) {
            showMessage('Please login to view categories', 'error');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await categoryService.getCategories(currentUser.uid);
            console.log('Loaded categories:', data); // Debug log
            setCategories(data);
        } catch (error) {
            console.error('Load categories error:', error);
            setError(error.message);
            showMessage('Failed to load categories', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [currentUser]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
        setCurrentPage(1);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowAddModal(true); // Reuse the add modal for editing
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
    };

    const toggleAddModal = () => {
        setShowAddModal(prev => !prev);
        if (editingCategory) {
            setEditingCategory(null);
        }
    };

    const handleAddCategory = async (categoryData) => {
        if (!currentUser) {
            showMessage('Please login to add categories', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await categoryService.addCategory(currentUser.uid, categoryData);
            showMessage('Category added successfully', 'success');
            await loadCategories();
            toggleAddModal(); // Close modal after success
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategory = async (categoryId, updatedData) => {
        if (!currentUser) {
            showMessage('Please login to update categories', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await categoryService.updateCategory(currentUser.uid, categoryId, updatedData);
            showMessage('Category updated successfully', 'success');
            await loadCategories();
            setEditingCategory(null);
            setShowAddModal(false);
        } catch (error) {
            console.error('Update category error:', error);
            showMessage(error.message || 'Failed to update category', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!currentUser) {
            showMessage('Please login to delete categories', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await categoryService.deleteCategory(currentUser.uid, categoryId);
            showMessage('Category deleted successfully', 'success');
            await loadCategories(); // Refresh the categories list
        } catch (error) {
            console.error('Delete category error:', error);
            showMessage(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div
                className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden
                    ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileOpen(false)}
                aria-hidden="true"
            />

            <Sidebar
                isMobileOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
            />

            <div className="flex-1 lg:ml-64">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm mb-6">
                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        onClick={() => setIsMobileOpen(true)}
                                        aria-label="Open menu"
                                    >
                                        <MdMenu className="w-6 h-6 text-gray-600" />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded-lg">
                                            <MdCategory className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                                                Categories
                                            </h1>
                                            <p className="text-sm text-gray-600 hidden sm:block">
                                                Manage your transaction categories
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sm:hidden -mt-2 pb-4">
                                <p className="text-sm text-gray-600">
                                    Manage your transaction categories
                                </p>
                            </div>

                            <div className="hidden sm:flex items-center space-x-4 py-3">
                                <span className="text-gray-500">Settings</span>
                                <span className="text-gray-400">/</span>
                                <span className="font-medium text-gray-900">Categories</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div id="categoryList" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="border-b border-gray-200">
                                    <div className="px-6 py-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    Category List
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    View and manage your categories
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 relative">
                                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    placeholder="Search categories..."
                                                    value={searchTerm}
                                                    onChange={handleSearch}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="sm:w-48">
                                                <div className="relative">
                                                    <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <select
                                                        value={filterType}
                                                        onChange={handleFilterChange}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                                                    >
                                                        <option value="all">All Types</option>
                                                        <option value="expense">Expense</option>
                                                        <option value="income">Income</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {error && (
                                        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                                            {error}
                                        </div>
                                    )}
                                    <CategorySettings
                                        showOnlyList={true}
                                        categories={categories} // Add this prop
                                        isLoading={isLoading}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteCategory}
                                        searchTerm={searchTerm}
                                        filterType={filterType}
                                        editingCategory={editingCategory}
                                        onCancelEdit={handleCancelEdit}
                                        onSubmit={handleUpdateCategory}
                                        currentUser={currentUser}
                                    />
                                </div>

                                <div className="border-t border-gray-200 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1 || isLoading}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-700">
                                            Page {currentPage}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={isLoading}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={toggleAddModal}
                        />

                        {/* Modal Panel */}
                        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <CategoryForm
                                onSubmit={(data) => {
                                    if (editingCategory) {
                                        handleUpdateCategory(editingCategory.id, data);
                                    } else {
                                        handleAddCategory(data);
                                    }
                                }}
                                onCancel={toggleAddModal}
                                isSubmitting={isLoading}
                                initialData={editingCategory}
                                title={editingCategory ? "Edit Category" : "Add New Category"}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <AddCategoryFAB
                onClick={toggleAddModal}
                isOpen={showAddModal}
            />
        </div>
    );
}
