// Category Types
export const CATEGORY_TYPES = {
    EXPENSE: 'expense',
    INCOME: 'income'
};

// Category Status
export const CATEGORY_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

// Validation Rules
export const VALIDATION_RULES = {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
};

// Error Messages
export const ERROR_MESSAGES = {
    NAME_REQUIRED: 'Category name is required',
    NAME_TOO_SHORT: 'Category name must be at least 2 characters',
    NAME_EXISTS: 'A category with this name already exists',
    INVALID_TYPE: 'Invalid category type',
    INVALID_STATUS: 'Invalid category status'
};

// Default Values
export const DEFAULT_CATEGORY = {
    name: '',
    type: CATEGORY_TYPES.EXPENSE,
    status: CATEGORY_STATUS.ACTIVE
};
