import React from 'react';
import { MdAdd } from 'react-icons/md';

export default function AddCategoryFAB({ onClick, isOpen }) {
    return (
        <button
            onClick={onClick}
            className="fixed right-6 bottom-6 lg:right-8 lg:bottom-8 z-50 p-3 bg-indigo-600 
                text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform
                duration-200 transform hover:scale-110"
            aria-label="Add new category"
        >
            <MdAdd className="w-6 h-6" />
        </button>
    );
}
