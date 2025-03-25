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
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={onClose}
                />

                {/* Modal Panel */}
                <div className={`relative w-full max-w-lg transform transition-all duration-300 ease-out
                    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white">
                                    {initialData ? 'Update Task' : 'Create New Task'}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-white/80 hover:text-white
                                        hover:bg-white/10 focus:outline-none transition-colors"
                                >
                                    <MdClose className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 max-h-[calc(85vh-8rem)] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title Input */}
                                <div className="group">
                                    <label className="inline-block text-sm font-medium text-gray-700 
                                        after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 
                                            shadow-sm transition-colors duration-200
                                            focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white"
                                        placeholder="What needs to be done?"
                                        required
                                    />
                                </div>

                                {/* Status & Priority */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <MdOutlineCategory className="h-5 w-5 text-gray-400" />
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50
                                                shadow-sm transition-colors duration-200
                                                focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white"
                                        >
                                            <option value="pending">📝 Pending</option>
                                            <option value="in-progress">⏳ In Progress</option>
                                            <option value="urgent">🚨 Urgent</option>
                                            <option value="completed">✅ Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <MdFlag className="h-5 w-5 text-gray-400" />
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50
                                                shadow-sm transition-colors duration-200
                                                focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white"
                                        >
                                            <option value={0}>🟢 Low</option>
                                            <option value={1}>🟡 Medium</option>
                                            <option value={2}>🔴 High</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Due Date & Comment */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <MdAccessTime className="h-5 w-5 text-gray-400" />
                                            Due Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50
                                                shadow-sm transition-colors duration-200
                                                focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white"
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>

                                    <div>
                                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <MdComment className="h-5 w-5 text-gray-400" />
                                            Comment
                                        </label>
                                        <textarea
                                            value={formData.comment}
                                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                            rows={3}
                                            className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50
                                                shadow-sm transition-colors duration-200 resize-none
                                                focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white"
                                            placeholder="Add any additional details..."
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-4 py-2.5 text-gray-700
                                        font-medium rounded-lg border border-gray-300
                                        hover:bg-gray-50 focus:outline-none focus:ring-2
                                        focus:ring-offset-2 focus:ring-gray-500
                                        transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="w-full sm:w-auto px-4 py-2.5 text-white
                                        font-medium rounded-lg bg-gradient-to-r
                                        from-indigo-500 to-purple-500
                                        hover:from-indigo-600 hover:to-purple-600
                                        focus:outline-none focus:ring-2
                                        focus:ring-offset-2 focus:ring-indigo-500
                                        transition-all duration-200"
                                >
                                    {initialData ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
