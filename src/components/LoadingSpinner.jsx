import React from 'react';

export default function LoadingSpinner({ size = 'md', overlay = false }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const spinner = (
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600`} />
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
                    {spinner}
                    <p className="mt-4 text-gray-600 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center">
            {spinner}
        </div>
    );
}
