import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MdAdd, MdDelete, MdEdit, MdCheck, MdRefresh, MdFlag, MdAccessTime, MdSort, MdFilterList, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { ImSpinner8 } from 'react-icons/im';  // Add this import

const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (text) => {
        return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    });
};

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    { value: 'in-progress', label: 'In Progress', color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { value: 'completed', label: 'Completed', color: 'text-green-500', bgColor: 'bg-green-100' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-500', bgColor: 'bg-red-100' }
];

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'status', label: 'Status' },
    { value: 'text', label: 'Task Name' }
];

const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
        <div className="flex items-center gap-2">
            <ImSpinner8 className="w-5 h-5 animate-spin text-indigo-600" />
            <span className="text-sm text-indigo-600 font-medium">Updating status...</span>
        </div>
    </div>
);

const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-50">
        <div className="relative">
            <ImSpinner8 className="w-12 h-12 animate-spin text-indigo-600" />
            <div className="animate-pulse absolute inset-0 rounded-full bg-indigo-100/50 -z-10 scale-150" />
        </div>
    </div>
);

const DeleteConfirmDialog = ({ todo, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
                <div className="p-2 bg-red-100 rounded-full">
                    <MdDelete className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium">Delete Task</h3>
            </div>
            <p className="text-gray-500">
                Are you sure you want to delete "<span className="text-gray-900 font-medium">{toTitleCase(todo.text)}</span>"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 
                        hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg 
                        hover:bg-red-700 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);

const TodoDetails = ({ todo, onClose, updateTodoStatus, formatDate, updateDoc, db, fetchTodos }) => {
    const [localDueDate, setLocalDueDate] = useState(todo.dueDate || '');
    const [localNotes, setLocalNotes] = useState(todo.notes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleDueDateChange = async (e) => {
        const newDate = e.target.value;
        setLocalDueDate(newDate);
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'todos', todo.id), {
                dueDate: newDate || null,
                updatedAt: new Date()
            });
            await fetchTodos();
        } catch (error) {
            console.error('Error updating due date:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotesChange = async (e) => {
        const newNotes = e.target.value;
        setLocalNotes(newNotes);
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'todos', todo.id), {
                notes: newNotes,
                updatedAt: new Date()
            });
            await fetchTodos();
        } catch (error) {
            console.error('Error updating notes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 
        transition-all duration-200 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden
            transform transition-all duration-300 animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-start justify-between sticky top-0 bg-white/80 backdrop-blur-sm">
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-gray-900">{toTitleCase(todo.text)}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1">
                                <MdAccessTime className="w-4 h-4" />
                                Created {formatDate(todo.createdAt)}
                            </span>
                            {todo.dueDate && (
                                <span className="inline-flex items-center gap-1 text-indigo-500">
                                    <MdFlag className="w-4 h-4" />
                                    Due {new Date(todo.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    {/* Status Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Status</h4>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => updateTodoStatus(todo.id, option.value)}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm 
                                    font-medium transition-all duration-200 
                                    ${todo.status === option.value
                                            ? `${option.bgColor} ${option.color}`
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full mr-2 
                                    ${todo.status === option.value ? option.color.replace('text', 'bg') : 'bg-gray-400'}`}
                                    />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Due Date and Notes Section */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Due Date</h4>
                            <input
                                type="datetime-local"
                                value={localDueDate}
                                onChange={handleDueDateChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm
                                focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 
                                transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                            <textarea
                                value={localNotes}
                                onChange={handleNotesChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm h-32
                                focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 
                                transition-all duration-200 resize-none"
                                placeholder="Add notes here..."
                            />
                        </div>
                    </div>

                    {/* History Timeline */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">History</h4>
                        <div className="space-y-3 relative before:absolute before:left-2 before:top-2 
                        before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {[...(todo.history || [])].reverse().map((record, idx) => (
                                <div key={idx} className="flex gap-4 relative">
                                    <div className="w-4 h-4 rounded-full bg-white border-2 border-indigo-500 
                                    flex-shrink-0 mt-1" />
                                    <div className="flex-1 bg-gray-50 rounded-xl p-3 text-sm">
                                        <div className="text-gray-400 text-xs mb-1">
                                            {new Date(record.timestamp?.seconds * 1000).toLocaleString()}
                                        </div>
                                        <div className="text-gray-600">{record.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusButton = ({ option, currentStatus, onClick, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs 
            font-medium transition-all duration-200 relative
            ${currentStatus === option.value
                ? `${option.bgColor} ${option.color} shadow-sm ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-200`
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
            disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {isLoading ? (
            <div className="flex items-center gap-2">
                <ImSpinner8 className="w-3 h-3 animate-spin" />
                <span>Updating...</span>
            </div>
        ) : (
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full 
                    ${currentStatus === option.value ? option.color.replace('text', 'bg') : 'bg-gray-400'}`}
                />
                {option.label}
            </div>
        )}
    </button>
);

export default function TodoList({ onUpdate, autoLoad = true }) {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loadingTodoId, setLoadingTodoId] = useState(null);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [filterStatus, setFilterStatus] = useState('all');
    const [nameFilter, setNameFilter] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [todoToDelete, setTodoToDelete] = useState(null);

    useEffect(() => {
        if (autoLoad) {
            fetchTodos();
        }
    }, [currentUser, autoLoad]);

    useEffect(() => {
        return () => {
            setIsLoading(false);
            setLoadingTodoId(null);
        };
    }, []);

    const fetchTodos = async () => {
        if (!currentUser?.uid) {
            setError('User not authenticated');
            return;
        }

        setIsLoading(true);
        try {
            const q = query(
                collection(db, 'todos'),
                where('userId', '==', currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const todosData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                // Ensure we have a proper history array
                history: doc.data().history || []
            }));
            setTodos(todosData);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error fetching todos:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTodo = useCallback(async (e) => {
        e.preventDefault();
        if (!newTodo.trim() || !currentUser?.uid) return;

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'todos'), {
                text: newTodo,
                completed: false,
                status: 'pending',
                priority: 'normal',
                userId: currentUser.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
                dueDate: null,
                notes: '',
                history: [{
                    status: 'pending',
                    timestamp: new Date(),
                    note: 'Task created'
                }]
            });
            setNewTodo('');
            await fetchTodos();
        } catch (error) {
            console.error('Error adding todo:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [newTodo, currentUser?.uid]);

    const toggleTodo = async (todoId, currentStatus) => {
        if (!currentUser?.uid) return;

        try {
            const todoRef = doc(db, 'todos', todoId);
            const todoDoc = await getDoc(todoRef);
            if (!todoDoc.exists()) return;

            const currentTodo = todoDoc.data();
            const now = new Date();
            const newCompleted = !currentTodo.completed;

            // If unchecking, revert to previous non-completed status or pending
            const prevStatus = currentTodo.prevStatus || 'pending';
            const newStatus = newCompleted ? 'completed' : prevStatus;

            const historyEntry = {
                status: newStatus,
                timestamp: now,
                note: newCompleted
                    ? 'Task marked as completed'
                    : 'Task unmarked as completed',
                updatedBy: currentUser.email
            };

            // Store current status before completing
            const updates = {
                completed: newCompleted,
                status: newStatus,
                updatedAt: now,
                history: [...(currentTodo.history || []), historyEntry]
            };

            // Save previous status only when completing the task
            if (newCompleted) {
                updates.prevStatus = currentTodo.status;
            }

            await updateDoc(todoRef, updates);

            // Update local state
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === todoId
                        ? {
                            ...todo,
                            ...updates,
                        }
                        : todo
                )
            );

            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating todo:', error);
            setError('Failed to update task completion status');
            await fetchTodos();
        }
    };

    const deleteTodo = async (todoId) => {
        if (!currentUser?.uid) return;
        setActionLoadingId(todoId);
        setActionType('delete');
        try {
            await deleteDoc(doc(db, 'todos', todoId));
            await fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
            setError('Failed to delete task');
        } finally {
            setActionLoadingId(null);
            setActionType(null);
        }
    };

    const startEditing = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
    };

    const updateTodo = async () => {
        if (!editText.trim() || !currentUser?.uid) return;

        try {
            await updateDoc(doc(db, 'todos', editingId), {
                text: editText,
                updatedAt: new Date()
            });
            setEditingId(null);
            setEditText('');
            await fetchTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const handleRefresh = () => {
        fetchTodos();
    };

    const getStatusColor = useCallback((status) => {
        const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
        return {
            text: statusOption?.color || 'text-gray-500',
            bg: statusOption?.bgColor || 'bg-gray-100'
        };
    }, []);

    const updateTodoStatus = async (todoId, newStatus) => {
        // Don't update if it's the same status
        const currentTodo = todos.find(t => t.id === todoId);
        if (currentTodo?.status === newStatus) return;

        try {
            setLoadingTodoId(todoId);
            const todoRef = doc(db, 'todos', todoId);

            // Get the latest data from Firestore
            const todoDoc = await getDoc(todoRef);
            if (!todoDoc.exists()) {
                throw new Error(`Todo with ID ${todoId} not found`);
            }

            const currentTodo = todoDoc.data();
            const now = new Date();
            const historyEntry = {
                status: newStatus,
                timestamp: now,
                note: `Status changed from ${currentTodo.status} to ${newStatus}`,
                updatedBy: currentUser.email
            };

            // Update Firestore
            await updateDoc(todoRef, {
                status: newStatus,
                updatedAt: now,
                completed: newStatus === 'completed',
                history: [...(currentTodo.history || []), historyEntry]
            });

            // Update local state
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === todoId
                        ? {
                            ...todo,
                            status: newStatus,
                            completed: newStatus === 'completed',
                            updatedAt: now,
                            history: [...(todo.history || []), historyEntry]
                        }
                        : todo
                )
            );

            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error updating todo status:', error);
            setError(`Failed to update task status: ${error.message}`);
            // Refresh todos to ensure sync
            await fetchTodos();
        } finally {
            setLoadingTodoId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = date instanceof Date ? date : date.toDate();
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(d);
    };

    const getSortedAndFilteredTodos = useCallback(() => {
        let filteredTodos = [...todos];

        // Filter by status
        if (filterStatus !== 'all') {
            filteredTodos = filteredTodos.filter(todo => todo.status === filterStatus);
        }

        // Filter by name
        if (nameFilter.trim()) {
            const searchTerm = nameFilter.toLowerCase().trim();
            filteredTodos = filteredTodos.filter(todo =>
                todo.text.toLowerCase().includes(searchTerm)
            );
        }

        // Sort logic remains the same
        return filteredTodos.sort((a, b) => {
            if (a.status === 'urgent' && b.status !== 'urgent') return -1;
            if (b.status === 'urgent' && a.status !== 'urgent') return 1;

            switch (sortBy) {
                case 'dueDate': return (a.dueDate || '') > (b.dueDate || '') ? 1 : -1;
                case 'status': return a.status > b.status ? 1 : -1;
                case 'text': return a.text.localeCompare(b.text);
                default: return b.createdAt - a.createdAt;
            }
        });
    }, [todos, filterStatus, sortBy, nameFilter]); // Add nameFilter to dependencies

    const handleDelete = (todo) => {
        setTodoToDelete(todo);
    };

    const confirmDelete = async () => {
        if (!todoToDelete) return;

        try {
            setActionLoadingId(todoToDelete.id);
            setActionType('delete');
            await deleteDoc(doc(db, 'todos', todoToDelete.id));
            await fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
            setError('Failed to delete task');
        } finally {
            setActionLoadingId(null);
            setActionType(null);
            setTodoToDelete(null);
        }
    };

    const TodoItem = useMemo(() => ({ todo }) => {
        const isCompleted = todo.status === 'completed';
        const isLoading = loadingTodoId === todo.id; // Change this to use loadingTodoId instead of actionLoadingId

        // Get shadow color based on status
        const getStatusShadow = () => {
            switch (todo.status) {
                case 'urgent': return 'hover:shadow-[0_8px_30px_rgb(239,68,68,0.15)] border-l-4 border-l-red-500';
                case 'completed': return 'hover:shadow-[0_8px_30px_rgb(34,197,94,0.15)] border-l-4 border-l-green-500';
                case 'in-progress': return 'hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] border-l-4 border-l-blue-500';
                case 'pending': return 'hover:shadow-[0_8px_30px_rgb(234,179,8,0.15)] border-l-4 border-l-yellow-500';
                default: return 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
            }
        };

        return (
            <div className={`group relative overflow-hidden flex items-center justify-between gap-4 p-5 
                bg-white border border-gray-100 rounded-2xl transition-all duration-300 
                ${getStatusShadow()}
                ${isLoading ? 'shadow-lg scale-[0.99] pointer-events-none' : ''}`}
            >
                {/* Single Loading Overlay */}
                {isLoading && <LoadingSpinner />}

                {/* Left side with improved checkbox */}
                <div className="flex items-start gap-4 min-w-0 flex-shrink">
                    <button
                        onClick={() => toggleTodo(todo.id, todo.status)}
                        className={`relative flex items-center justify-center flex-shrink-0 w-6 h-6 
                            transition-all duration-200 rounded-lg group/check
                            ${isCompleted
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                    >
                        {isCompleted ? (
                            <MdCheckBox className="w-6 h-6" />
                        ) : (
                            <MdCheckBoxOutlineBlank className="w-6 h-6" />
                        )}
                        <span className="sr-only">
                            {isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        </span>
                    </button>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className={`font-medium text-sm sm:text-base transition-all duration-200
                                ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {toTitleCase(todo.text)}
                            </span>
                            {todo.status === 'urgent' && !isCompleted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs 
                                    font-medium bg-red-100 text-red-800 animate-pulse">
                                    <MdFlag className="w-3.5 h-3.5" />
                                    Urgent
                                </span>
                            )}
                        </div>

                        {/* Improved metadata display */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                                <MdAccessTime className="w-3.5 h-3.5" />
                                {formatDate(todo.createdAt)}
                            </span>
                            {todo.dueDate && (
                                <span className="inline-flex items-center gap-1.5">
                                    <MdFlag className="w-3.5 h-3.5" />
                                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                                </span>
                            )}
                            {todo.notes && (
                                <span className="inline-flex items-center gap-1.5 text-indigo-500">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Has notes
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side - Status and Actions */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                onClick={() => updateTodoStatus(todo.id, option.value)}
                                disabled={isLoading}
                                className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs 
                                    font-medium transition-all duration-200 
                                    ${todo.status === option.value
                                        ? `${option.bgColor} ${option.color} shadow-sm ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-200`
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 
                                    ${todo.status === option.value ? option.color.replace('text', 'bg') : 'bg-gray-400'}`}
                                />
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200">
                        <button
                            onClick={() => { setSelectedTodo(todo); setShowDetails(true); }}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl 
                                hover:bg-gray-50 transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View Details"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleDelete(todo)}
                            disabled={isLoading}
                            className="p-2 text-red-500 hover:text-red-600 rounded-xl 
                                hover:bg-red-50 transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Task"
                        >
                            <MdDelete className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }, [loadingTodoId, updateTodoStatus]); // Update dependencies

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 relative h-screen flex flex-col">
            {isLoading && <LoadingOverlay />}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 
                    rounded-2xl flex items-center justify-between shadow-sm flex-shrink-0">
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </span>
                    <button onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-600 transition-colors duration-200">
                        ×
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-4 sm:gap-6 mb-8 flex-shrink-0">
                {/* Filter and Sort Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
                    <div className="flex items-center gap-3 flex-1">
                        <button
                            onClick={handleRefresh}
                            className="p-3 rounded-xl transition-all duration-200 bg-indigo-50/50 
                                text-indigo-600 hover:bg-indigo-100 hover:shadow-md flex-shrink-0"
                        >
                            <MdRefresh size={20} />
                        </button>
                        <div className="flex-1 flex gap-3">
                            <input
                                type="text"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                placeholder="Filter by name..."
                                className="w-full p-3 border rounded-xl text-sm bg-white
                                    focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 
                                    transition-all duration-200"
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full sm:w-48 p-3 border rounded-xl text-sm bg-white
                                    focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 
                                    transition-all duration-200"
                            >
                                <option value="all">All Status</option>
                                {STATUS_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center bg-gray-50/50 px-4 py-3 rounded-xl
                        focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200
                        sm:w-64">
                        <MdSort className="text-gray-400 mr-3 flex-shrink-0" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-transparent text-sm focus:outline-none"
                        >
                            {SORT_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    Sort by {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Add Todo Form */}
                <form onSubmit={handleAddTodo} className="flex gap-3">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-grow p-4 border rounded-xl text-sm shadow-sm
                            focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 
                            transition-all duration-200"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="p-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 
                            transition-all duration-200 shadow-sm hover:shadow-md 
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MdAdd className="w-6 h-6" />
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 rounded-xl scrollbar-thin scrollbar-thumb-gray-200 
                scrollbar-track-transparent hover:scrollbar-thumb-gray-300 pr-2">
                <div className="space-y-4 pb-4">
                    {getSortedAndFilteredTodos().map(todo => (
                        <TodoItem key={todo.id} todo={todo} />
                    ))}

                    {todos.length === 0 && (
                        <div className="text-center py-16 px-4">
                            <div className="mx-auto h-16 w-16 text-gray-400 mb-6 
                                bg-gray-50 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-2">No tasks yet</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                Get started by creating your first task. Your tasks will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {
                showDetails && selectedTodo && (
                    <TodoDetails
                        todo={selectedTodo}
                        onClose={() => setShowDetails(false)}
                        updateTodoStatus={updateTodoStatus}
                        formatDate={formatDate}
                        updateDoc={updateDoc}
                        db={db}
                        fetchTodos={fetchTodos}
                    />
                )
            }

            {/* Add Delete Confirmation Dialog */}
            {todoToDelete && (
                <DeleteConfirmDialog
                    todo={todoToDelete}
                    onConfirm={confirmDelete}
                    onCancel={() => setTodoToDelete(null)}
                />
            )}
        </div >
    );
}
