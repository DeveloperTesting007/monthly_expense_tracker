import React, { useEffect, useState } from 'react';
import { 
    MdClose, MdAccessTime, MdComment, MdSend,
    MdHistory, MdLabel, MdOutlineCalendarToday,
    MdOutlineLabel
} from 'react-icons/md';

export default function TodoDetailModal({ isOpen, onClose, todo }) {
    const [comment, setComment] = useState('');

    // Handle ESC key press
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const getStatusBadgeColor = (status) => {
        const colors = {
            pending: 'bg-gray-100 text-gray-700',
            'in-progress': 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            overdue: 'bg-red-100 text-red-700'
        };
        return colors[status] || colors.pending;
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        // Add comment logic here
        setComment('');
    };

    if (!isOpen || !todo) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="relative mx-auto w-full max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-gray-900">{todo.title}</h2>
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                                    ${getStatusBadgeColor(todo.status)}`}>
                                    {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} 
                            className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                            <MdClose className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                        {/* Main Content - Left Side */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            {/* <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                                        {todo.description || 'No description provided'}
                                    </p>
                                </div>
                            </div> */}

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                                <div>
                                    <h4 className="text-xs font-medium text-gray-500">Created</h4>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <MdOutlineCalendarToday className="h-4 w-4 text-gray-400" />
                                        {new Date(todo.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {todo.dueDate && (
                                    <div>
                                        <h4 className="text-xs font-medium text-gray-500">Due Date</h4>
                                        <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                            <MdOutlineCalendarToday className="h-4 w-4 text-gray-400" />
                                            {new Date(todo.dueDate).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Labels */}
                            {todo.labels?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {todo.labels.map((label, index) => (
                                        <span key={index} 
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full 
                                                bg-gray-100 text-xs font-medium text-gray-600">
                                            <MdOutlineLabel className="h-3 w-3" />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Right Side */}
                        <div className="space-y-6">
                            {/* Comments Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                        <MdComment className="h-4 w-4" /> 
                                        Comments ({todo.comments?.length || 0})
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <form onSubmit={handleAddComment} className="mb-6">
                                        <div className="flex items-start gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {todo.user?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder="Write a comment..."
                                                    className="w-full rounded-lg border-gray-200 text-sm px-4 py-2.5 
                                                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                />
                                                {comment.trim() && (
                                                    <div className="mt-2 flex justify-end">
                                                        <button
                                                            type="submit"
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg
                                                                bg-blue-50 text-blue-600 text-sm font-medium 
                                                                hover:bg-blue-100 transition-colors"
                                                        >
                                                            <MdSend className="h-4 w-4" />
                                                            Send
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                    
                                    <div className="space-y-4">
                                        {todo.comments?.map((comment, index) => (
                                            <div key={index} className="flex gap-3 group">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center 
                                                    justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {comment.author?.charAt(0) || 'U'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {comment.author}
                                                        </span>
                                                        <span className="text-xs text-gray-500">•</span>
                                                        <time className="text-xs text-gray-500">
                                                            {new Date(comment.timestamp).toLocaleString()}
                                                        </time>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* History Timeline */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <MdHistory className="h-4 w-4" /> Activity
                                </h3>
                                <div className="space-y-3">
                                    {todo.history?.map((event, index) => (
                                        <div key={index} className="relative pl-3 border-l-2 border-gray-200">
                                            <p className="text-sm text-gray-600">{event.action}</p>
                                            {event.details && (
                                                <p className="mt-1 text-xs text-gray-500">{event.details}</p>
                                            )}
                                            <time className="block mt-1 text-xs text-gray-400">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </time>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
