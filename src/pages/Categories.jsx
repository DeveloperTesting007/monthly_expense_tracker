import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import CategorySettings from '../components/CategorySettings';
import { MdMenu, MdSettings, MdCategory } from 'react-icons/md';

export default function Categories() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isMobileOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-72">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Header Content */}
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center flex-1">
                                <button
                                    onClick={() => setIsMobileOpen(true)}
                                    className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <MdMenu size={24} />
                                </button>
                                <div className="ml-4">
                                    <div className="flex items-center">
                                        <MdCategory className="h-8 w-8 text-indigo-600" />
                                        <div className="ml-3">
                                            <h1 className="text-lg font-semibold text-gray-900">Categories</h1>
                                            <p className="text-sm text-gray-500">Manage your transaction categories</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-4 py-3">
                            <span className="text-gray-500">Settings</span>
                            <span className="text-gray-400">/</span>
                            <span className="font-medium text-gray-900">Categories</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="space-y-6">
                            {/* Form Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <CategorySettings showOnlyForm={true} />
                            </div>

                            {/* List Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <CategorySettings showOnlyList={true} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
