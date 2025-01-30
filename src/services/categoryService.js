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

// Add a new category
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

        const docRef = await addDoc(collection(db, 'categories'), category);
        return { id: docRef.id, ...category };
    } catch (error) {
        console.error('Add category error:', error);
        if (error.code === 'permission-denied') {
            throw new Error('You do not have permission to create categories');
        }
        throw new Error('Failed to add category: ' + error.message);
    }
};

// Get all categories for a user with proper sorting
export const getCategories = async () => {
    try {
        const categoriesRef = collection(db, 'categories');
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
        throw new Error('Failed to fetch categories');
    }
};

// Update a category
export const updateCategory = async (categoryId, categoryData) => {
    if (!categoryId) throw new Error('Category ID is required');

    try {
        const categoryRef = doc(db, 'categories', categoryId);
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
export const deleteCategory = async (categoryId) => {
    if (!categoryId) throw new Error('Category ID is required');

    try {
        await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
        console.error('Delete category error:', error);
        throw new Error('Failed to delete category');
    }
};
