import React, { useState, useEffect } from 'react';
import { MdClose, MdAccessTime, MdFlag, MdOutlineCategory, MdComment } from 'react-icons/md';

export default function TodoModal({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        title: '',
        status: 'pending',
        priority: 0,
        dueDate: '',
        comment: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                status: initialData.status || 'pending',
                priority: initialData.priority || 0,
                dueDate: initialData.dueDate || '',
                comment: '',
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const validatedData = {
            ...formData,
            title: formData.title.trim(),
            dueDate: formData.dueDate || null,
            comment: formData.comment.trim()
        };
        
        onSubmit(validatedData);
        setFormData({
            title: '',
            status: 'pending',
            priority: 0,
            dueDate: '',
            comment: '',
        });
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? '' : 'hidden'}`}>
            <div className="flex min-h-screen items-end sm:items-center justify-center">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal Panel */}
                <div className="relative w-full sm:max-w-lg transform transition-all">
                    {/* Mobile-optimized container */}
                    <div className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl 
                        overflow-hidden max-h-[92vh] sm:max-h-[85vh]">
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-white px-4 py-4 sm:px-6 
                            border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {initialData ? 'Update Task' : 'New Task'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-gray-400 hover:text-gray-500
                                    hover:bg-gray-100 focus:outline-none"
                            >
                                <MdClose className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 sm:p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm
                                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="What needs to be done?"
                                        required
                                    />
                                </div>

                                {/* Status & Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <MdOutlineCategory className="h-5 w-5 text-gray-400" />
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm
                                                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <MdFlag className="h-5 w-5 text-gray-400" />
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm
                                                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value={0}>Low</option>
                                            <option value={1}>Medium</option>
                                            <option value={2}>High</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <MdAccessTime className="h-5 w-5 text-gray-400" />
                                        Due Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm
                                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <MdComment className="h-5 w-5 text-gray-400" />
                                        Comment
                                    </label>
                                    <textarea
                                        value={formData.comment}
                                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                        rows={3}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm
                                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                                            resize-none"
                                        placeholder="Add any additional details..."
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-4 py-3 sm:px-6 
                            border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-2 sm:gap-3"></div>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white 
                                    font-medium rounded-lg hover:bg-indigo-700 focus:outline-none 
                                    focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {initialData ? 'Update Task' : 'Create Task'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-4 py-2.5 bg-white text-gray-700 
                                    font-medium rounded-lg border border-gray-300 hover:bg-gray-50 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                                    focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        
    );
}
