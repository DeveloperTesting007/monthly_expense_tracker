import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export class TodoService {
    static async getTodoStats(userId) {
        if (!userId) return null;

        const q = query(
            collection(db, 'todos'),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const todos = querySnapshot.docs.map(doc => doc.data());

        const statusCounts = todos.reduce((acc, todo) => {
            if (todo.completed) {
                acc.completed++;
            } else {
                switch (todo.status) {
                    case 'pending': acc.pending++; break;
                    case 'in-progress': acc.inProgress++; break;
                    case 'urgent': acc.urgent++; break;
                }
            }
            return acc;
        }, { completed: 0, pending: 0, inProgress: 0, urgent: 0 });

        return {
            total: todos.length,
            completed: statusCounts.completed,
            pending: statusCounts.pending + statusCounts.inProgress,
            urgent: statusCounts.urgent,
            details: {
                pending: statusCounts.pending,
                inProgress: statusCounts.inProgress
            }
        };
    }

    static async getTodos(userId) {
        const q = query(collection(db, 'todos'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    static async addTodo(userId, todoData) {
        const todo = {
            ...todoData,
            userId,
            createdAt: new Date().toISOString(),
            status: todoData.status || 'pending',
            completed: false
        };
        const docRef = await addDoc(collection(db, 'todos'), todo);
        return { id: docRef.id, ...todo };
    }

    static async updateTodo(todoId, updates) {
        const todoRef = doc(db, 'todos', todoId);
        await updateDoc(todoRef, updates);
        return { id: todoId, ...updates };
    }

    static async deleteTodo(todoId) {
        const todoRef = doc(db, 'todos', todoId);
        await deleteDoc(todoRef);
        return todoId;
    }
}
