import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    serverTimestamp,
    orderBy 
} from 'firebase/firestore';

export class CategoryService {
    static getDefaultCategories() {
        return [
            { name: 'Salary', type: 'income', icon: '💰', color: '#4CAF50',status:'active'},
            { name: 'Other', type: 'income', icon: '💡', color: '#2196F3',status:'active' },
            { name: 'Loan', type: 'expense', icon: '🏦', color: '#F44336',status:'active' },
            { name: 'Food', type: 'expense', icon: '🍽️', color: '#FF9800',status:'active' },
            { name: 'Other', type: 'expense', icon: '📦', color: '#9E9E9E',status:'active' }
        ];
    }

    static async createDefaultCategories(userId) {
        const categoriesRef = collection(db, 'monthly_tracker', userId, 'categories');
        const defaultCategories = this.getDefaultCategories();
        
        const promises = defaultCategories.map(category => 
            addDoc(categoriesRef, {
                ...category,
                userId,
                createdAt: new Date().toISOString()
            })
        );

        await Promise.all(promises);
    }
}

// Add a new category and refresh the list of categories
export const addCategory = async (userId, categoryData) => {
    if (!userId) throw new Error('User ID is required');
    if (!categoryData.name) throw new Error('Category name is required');
    if (!categoryData.type) throw new Error('Category type is required');

    try {
        const category = {
            name: categoryData.name.trim(),
            type: categoryData.type.toLowerCase(),
            status: categoryData.status || 'active',
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, `monthly_tracker/${userId}/categories`), category);
        
        // Refresh the list of categories after successful creation
        const updatedCategories = await getCategories(userId);
        return { id: docRef.id, ...category, updatedCategories };
    } catch (error) {
        console.error('Add category error:', error);
        if (error.code === 'permission-denied') {
            throw new Error('You do not have permission to create categories');
        }
        throw new Error('Failed to add category: ' + error.message);
    }
};

// Get all categories for a user with proper sorting
export const getCategories = async (userId) => {
    if (!userId) throw new Error('User ID is required');

    try {
        const categoriesRef = collection(db, `monthly_tracker/${userId}/categories`);
        const q = query(categoriesRef, orderBy('name', 'asc'));
        const snapshot = await getDocs(q);
        
        const categories = {
            expense: [],
            income: []
        };

        snapshot.forEach((doc) => {
            const category = {
                id: doc.id,
                ...doc.data()
            };
            if (categories[category.type]) {
                categories[category.type].push(category);
            }
        });

        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.code === 'permission-denied') {
            throw new Error('You do not have permission to access categories');
        }
        throw new Error('Failed to fetch categories: ' + error.message);
    }
};

// Update a category
export const updateCategory = async (userId, categoryId, categoryData) => {
    if (!userId) throw new Error('User ID is required');
    if (!categoryId) throw new Error('Category ID is required');

    try {
        const categoryRef = doc(db, `monthly_tracker/${userId}/categories`, categoryId);
        const updateData = {
            ...categoryData,
            updatedAt: serverTimestamp()
        };

        await updateDoc(categoryRef, updateData);
        return { id: categoryId, ...updateData };
    } catch (error) {
        console.error('Update category error:', error);
        throw new Error('Failed to update category');
    }
};

// Delete a category
export const deleteCategory = async (userId, categoryId) => {
    if (!userId) throw new Error('User ID is required');
    if (!categoryId) throw new Error('Category ID is required');

    try {
        await deleteDoc(doc(db, `monthly_tracker/${userId}/categories`, categoryId));
    } catch (error) {
        console.error('Delete category error:', error);
        throw new Error('Failed to delete category');
    }
};
