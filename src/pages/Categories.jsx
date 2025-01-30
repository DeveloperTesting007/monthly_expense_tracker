import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import CategorySettings from '../components/CategorySettings';
import { MdMenu, MdCategory } from 'react-icons/md';

export default function Categories() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white/10 rounded-lg">
                                            <MdCategory className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">
                                                Add Category
                                            </h2>
                                            <p className="text-indigo-100 text-sm">
                                                Create new transaction categories
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <CategorySettings showOnlyForm={true} />
                                </div>
                            </div>

                            {/* List Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* <div className="border-b border-gray-200">
                                    <div className="px-6 py-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Category List
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            View and manage your categories
                                        </p>
                                    </div>
                                </div> */}
                                <div className="p-6">
                                    <CategorySettings showOnlyList={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
