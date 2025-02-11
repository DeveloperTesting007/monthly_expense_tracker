import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import CategorySettings from '../components/CategorySettings';
import { MdMenu, MdCategory, MdRefresh, MdSearch, MdFilterList } from 'react-icons/md';

export default function Categories() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [editingCategory, setEditingCategory] = useState(null);

    const handleRefresh = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Implement your refresh logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        // Scroll to form section
        document.querySelector('#categoryForm').scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
    };

    const handleEditSuccess = () => {
        setEditingCategory(null);
        handleRefresh();
        document.querySelector('#categoryList').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden
                    ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <Sidebar
                isMobileOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Mobile Header */}
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

                            {/* Mobile Subheader */}
                            <div className="sm:hidden -mt-2 pb-4">
                                <p className="text-sm text-gray-600">
                                    Manage your transaction categories
                                </p>
                            </div>

                            {/* Breadcrumb - Hidden on mobile */}
                            <div className="hidden sm:flex items-center space-x-4 py-3">
                                <span className="text-gray-500">Settings</span>
                                <span className="text-gray-400">/</span>
                                <span className="font-medium text-gray-900">Categories</span>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="space-y-6">
                            {/* Form Section */}
                            <div id="categoryForm" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-white/10 rounded-lg">
                                                <MdCategory className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-white">
                                                    {editingCategory ? 'Edit Category' : 'Add Category'}
                                                </h2>
                                                <p className="text-indigo-100 text-sm">
                                                    {editingCategory 
                                                        ? `Editing "${editingCategory.name}"`
                                                        : 'Create new transaction category'}
                                                </p>
                                            </div>
                                        </div>
                                        {editingCategory && (
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-3 py-1 text-sm text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <CategorySettings 
                                        showOnlyForm={true} 
                                        onSuccess={handleEditSuccess}
                                        editingCategory={editingCategory}
                                        onCancelEdit={handleCancelEdit}
                                    />
                                </div>
                            </div>

                            {/* List Section */}
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
                                            <button
                                                onClick={handleRefresh}
                                                disabled={isLoading}
                                                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
                                                aria-label="Refresh categories"
                                            >
                                                <MdRefresh className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                        
                                        {/* Filter Controls */}
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
                                        isLoading={isLoading}
                                        onRefresh={handleRefresh}
                                        searchTerm={searchTerm}
                                        filterType={filterType}
                                        currentPage={currentPage}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={setCurrentPage}
                                        onEdit={handleEdit}
                                        editingCategoryId={editingCategory?.id}
                                    />
                                </div>

                                {/* Pagination Controls */}
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
        </div>
    );
}
