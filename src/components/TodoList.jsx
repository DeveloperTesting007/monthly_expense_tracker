import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { MdAdd, MdDelete, MdEdit, MdCheck, MdRefresh, MdFlag, MdAccessTime, MdSort, MdFilterList } from 'react-icons/md';

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
        }
    };

    const handleAddTodo = useCallback(async (e) => {
        e.preventDefault();
        if (!newTodo.trim() || !currentUser?.uid) return;

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
        }
    }, [newTodo, currentUser?.uid]);

    const toggleTodo = async (todoId, completed) => {
        if (!currentUser?.uid) return;

        try {
            await updateDoc(doc(db, 'todos', todoId), {
                completed: !completed,
                updatedAt: new Date()
            });
            await fetchTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const deleteTodo = async (todoId) => {
        if (!currentUser?.uid) return;

        try {
            await deleteDoc(doc(db, 'todos', todoId));
            await fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
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
        try {
            // Find the todo in our local state first
            const currentTodo = todos.find(t => t.id === todoId);
            if (!currentTodo) {
                throw new Error(`Todo with ID ${todoId} not found`);
            }

            const todoRef = doc(db, 'todos', todoId);
            const now = new Date();
            const historyEntry = {
                status: newStatus,
                timestamp: now,
                note: `Status changed from ${currentTodo.status} to ${newStatus}`,
                updatedBy: currentUser.email
            };

            // First update Firestore
            await updateDoc(todoRef, {
                status: newStatus,
                updatedAt: now,
                completed: newStatus === 'completed',
                history: [...currentTodo.history, historyEntry]
            });

            // Then update local state
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === todoId
                        ? {
                            ...todo,
                            status: newStatus,
                            completed: newStatus === 'completed',
                            updatedAt: now,
                            history: [...todo.history, historyEntry]
                        }
                        : todo
                )
            );

            // Trigger stats update
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error updating todo status:', error);
            setError(`Failed to update task status: ${error.message}`);
            // Refresh todos to ensure sync
            await fetchTodos();
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

        if (filterStatus !== 'all') {
            filteredTodos = filteredTodos.filter(todo => todo.status === filterStatus);
        }

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
    }, [todos, filterStatus, sortBy]);

    const TodoDetails = ({ todo }) => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{todo.text}</h3>
                        <button
                            onClick={() => setShowDetails(false)}
                            className="text-gray-400 hover:text-gray-500 p-1"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="flex gap-2">
                            {STATUS_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => updateTodoStatus(todo.id, option.value)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium 
                                        ${todo.status === option.value
                                            ? 'bg-gray-100 ' + option.color
                                            : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                        <input
                            type="datetime-local"
                            value={todo.dueDate || ''}
                            onChange={async (e) => {
                                await updateDoc(doc(db, 'todos', todo.id), {
                                    dueDate: e.target.value,
                                    updatedAt: new Date()
                                });
                                fetchTodos();
                            }}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="mb-6"></div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                        value={todo.notes || ''}
                        onChange={async (e) => {
                            await updateDoc(doc(db, 'todos', todo.id), {
                                notes: e.target.value,
                                updatedAt: new Date()
                            });
                            fetchTodos();
                        }}
                        className="w-full px-3 py-2 border rounded-lg h-32"
                        placeholder="Add notes here..."
                    />
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">History</h4>
                    <div className="space-y-3">
                        {[...(todo.history || [])].reverse().map((record, idx) => (
                            <div key={idx} className="flex gap-3 text-sm">
                                <div className="text-gray-400">
                                    {new Date(record.timestamp?.seconds * 1000).toLocaleString()}
                                </div>
                                <div className="text-gray-600">{record.note}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const TodoItem = useMemo(() => ({ todo }) => (
        <div className={`group relative overflow-hidden flex flex-col lg:flex-row items-start 
            lg:items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl
            transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            hover:border-gray-200 transform hover:-translate-y-0.5
            ${todo.status === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}
        >
            <div className="flex items-start gap-4 w-full lg:w-auto">
                <div className="relative flex-shrink-0 mt-1">
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id, todo.completed)}
                        className="peer h-5 w-5 cursor-pointer rounded-lg border-gray-300 
                            text-indigo-600 transition-all duration-200
                            focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    />
                    <div className="absolute inset-0 bg-indigo-100 scale-0 peer-checked:scale-125 
                        rounded-full transition-transform duration-200 pointer-events-none opacity-50" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`font-medium text-gray-900 text-sm sm:text-base 
                            transition-all duration-200 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                            {todo.text}
                        </span>
                        {todo.status === 'urgent' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                                font-medium bg-red-100 text-red-800 animate-pulse">
                                Urgent
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <MdAccessTime className="w-3.5 h-3.5" />
                            {formatDate(todo.createdAt)}
                        </span>
                        {todo.dueDate && (
                            <span className="inline-flex items-center gap-1">
                                <MdFlag className="w-3.5 h-3.5" />
                                Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 
                w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-0">
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => updateTodoStatus(todo.id, option.value)}
                            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs 
                                font-medium transition-all duration-200 
                                ${todo.status === option.value
                                    ? `${option.bgColor} ${option.color} shadow-sm ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-200`
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 sm:ml-auto opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200">
                    <button
                        onClick={() => { setSelectedTodo(todo); setShowDetails(true); }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-xl 
                            hover:bg-gray-50 transition-all duration-200"
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
                        onClick={() => startEditing(todo)}
                        className="p-2 text-blue-500 hover:text-blue-600 rounded-xl 
                            hover:bg-blue-50 transition-all duration-200"
                    >
                        <MdEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-red-500 hover:text-red-600 rounded-xl 
                            hover:bg-red-50 transition-all duration-200"
                    >
                        <MdDelete className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </div>
    ), [getStatusColor]);

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 
                    rounded-2xl flex items-center justify-between shadow-sm">
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

            <div className="flex flex-col gap-4 sm:gap-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="p-3 rounded-xl transition-all duration-200 bg-indigo-50/50 
                                text-indigo-600 hover:bg-indigo-100 hover:shadow-md"
                        >
                            <MdRefresh size={20} />
                        </button>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-3 border rounded-xl text-sm bg-white
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

                    <div className="flex items-center bg-gray-50/50 px-4 py-3 rounded-xl 
                        focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200">
                        <MdSort className="text-gray-400 mr-3" />
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

            <div className="space-y-4">
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

            {
                showDetails && selectedTodo && (
                    <TodoDetails todo={selectedTodo} />
                )
            }
        </div >
    );
}
