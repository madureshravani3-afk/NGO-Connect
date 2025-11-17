"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBadgeUpdate = exports.validateNGORejection = exports.validateNGOVerification = exports.validateDonation = exports.validateNGOUpdate = exports.validateNGORegistration = exports.validateNewPassword = exports.validatePasswordReset = exports.validateProfileUpdate = exports.validateLogin = exports.validateRegistration = exports.isValidPincode = exports.isValidPhone = exports.isValidPassword = exports.isValidEmail = void 0;
const isValidEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPassword = (password) => {
    return Boolean(password && password.length >= 6);
};
exports.isValidPassword = isValidPassword;
const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
const isValidPincode = (pincode) => {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
};
exports.isValidPincode = isValidPincode;
const validateRegistration = (req, res, next) => {
    const { email, password, role, profile } = req.body;
    const errors = [];
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    else if (!(0, exports.isValidEmail)(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    }
    else if (!(0, exports.isValidPassword)(password)) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    }
    if (!role) {
        errors.push({ field: 'role', message: 'Role is required' });
    }
    else if (!['donor', 'ngo', 'admin'].includes(role)) {
        errors.push({ field: 'role', message: 'Role must be donor, ngo, or admin' });
    }
    if (!profile) {
        errors.push({ field: 'profile', message: 'Profile information is required' });
    }
    else {
        if (!profile.firstName) {
            errors.push({ field: 'profile.firstName', message: 'First name is required' });
        }
        else if (profile.firstName.length > 50) {
            errors.push({ field: 'profile.firstName', message: 'First name cannot exceed 50 characters' });
        }
        if (!profile.lastName) {
            errors.push({ field: 'profile.lastName', message: 'Last name is required' });
        }
        else if (profile.lastName.length > 50) {
            errors.push({ field: 'profile.lastName', message: 'Last name cannot exceed 50 characters' });
        }
        if (profile.phone && !(0, exports.isValidPhone)(profile.phone)) {
            errors.push({ field: 'profile.phone', message: 'Please enter a valid phone number' });
        }
        if (profile.address) {
            if (profile.address.pincode && !(0, exports.isValidPincode)(profile.address.pincode)) {
                errors.push({ field: 'profile.address.pincode', message: 'Please enter a valid 6-digit pincode' });
            }
            if (profile.address.coordinates) {
                const { lat, lng } = profile.address.coordinates;
                if (lat !== undefined && (lat < -90 || lat > 90)) {
                    errors.push({ field: 'profile.address.coordinates.lat', message: 'Latitude must be between -90 and 90' });
                }
                if (lng !== undefined && (lng < -180 || lng > 180)) {
                    errors.push({ field: 'profile.address.coordinates.lng', message: 'Longitude must be between -180 and 180' });
                }
            }
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validateRegistration = validateRegistration;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    else if (!(0, exports.isValidEmail)(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validateLogin = validateLogin;
const validateProfileUpdate = (req, res, next) => {
    const { profile } = req.body;
    const errors = [];
    if (profile) {
        if (profile.firstName !== undefined) {
            if (!profile.firstName) {
                errors.push({ field: 'profile.firstName', message: 'First name cannot be empty' });
            }
            else if (profile.firstName.length > 50) {
                errors.push({ field: 'profile.firstName', message: 'First name cannot exceed 50 characters' });
            }
        }
        if (profile.lastName !== undefined) {
            if (!profile.lastName) {
                errors.push({ field: 'profile.lastName', message: 'Last name cannot be empty' });
            }
            else if (profile.lastName.length > 50) {
                errors.push({ field: 'profile.lastName', message: 'Last name cannot exceed 50 characters' });
            }
        }
        if (profile.phone !== undefined && profile.phone && !(0, exports.isValidPhone)(profile.phone)) {
            errors.push({ field: 'profile.phone', message: 'Please enter a valid phone number' });
        }
        if (profile.address) {
            if (profile.address.pincode && !(0, exports.isValidPincode)(profile.address.pincode)) {
                errors.push({ field: 'profile.address.pincode', message: 'Please enter a valid 6-digit pincode' });
            }
            if (profile.address.coordinates) {
                const { lat, lng } = profile.address.coordinates;
                if (lat !== undefined && (lat < -90 || lat > 90)) {
                    errors.push({ field: 'profile.address.coordinates.lat', message: 'Latitude must be between -90 and 90' });
                }
                if (lng !== undefined && (lng < -180 || lng > 180)) {
                    errors.push({ field: 'profile.address.coordinates.lng', message: 'Longitude must be between -180 and 180' });
                }
            }
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validateProfileUpdate = validateProfileUpdate;
const validatePasswordReset = (req, res, next) => {
    const { email } = req.body;
    const errors = [];
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    else if (!(0, exports.isValidEmail)(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validatePasswordReset = validatePasswordReset;
const validateNewPassword = (req, res, next) => {
    const { password, confirmPassword } = req.body;
    const errors = [];
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    }
    else if (!(0, exports.isValidPassword)(password)) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    }
    if (!confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Password confirmation is required' });
    }
    else if (password !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validateNewPassword = validateNewPassword;
const validateNGORegistration = (req, res, next) => {
    let { organizationName, registrationNumber, categories, serviceRadius, website, pickupService } = req.body;
    const errors = [];
    if (typeof categories === 'string') {
        try {
            categories = JSON.parse(categories);
        }
        catch (error) {
            errors.push({ field: 'categories', message: 'Invalid categories format' });
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Please fix the following validation errors',
                    details: errors
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    if (typeof serviceRadius === 'string') {
        serviceRadius = parseFloat(serviceRadius);
    }
    if (typeof pickupService === 'string') {
        pickupService = pickupService === 'true';
    }
    if (!organizationName) {
        errors.push({ field: 'organizationName', message: 'Organization name is required' });
    }
    else if (organizationName.length > 200) {
        errors.push({ field: 'organizationName', message: 'Organization name cannot exceed 200 characters' });
    }
    if (!registrationNumber) {
        errors.push({ field: 'registrationNumber', message: 'Registration number is required' });
    }
    else if (registrationNumber.length > 50) {
        errors.push({ field: 'registrationNumber', message: 'Registration number cannot exceed 50 characters' });
    }
    const validCategories = ['food', 'clothing', 'education', 'healthcare', 'books', 'electronics'];
    if (!categories || !Array.isArray(categories)) {
        errors.push({ field: 'categories', message: 'Categories are required and must be an array' });
    }
    else if (categories.length === 0) {
        errors.push({ field: 'categories', message: 'At least one category must be selected' });
    }
    else {
        const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
        if (invalidCategories.length > 0) {
            errors.push({
                field: 'categories',
                message: `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${validCategories.join(', ')}`
            });
        }
    }
    if (serviceRadius !== undefined) {
        if (typeof serviceRadius !== 'number' || serviceRadius < 1 || serviceRadius > 100) {
            errors.push({ field: 'serviceRadius', message: 'Service radius must be a number between 1 and 100 km' });
        }
    }
    if (website && !/^https?:\/\/.+/.test(website)) {
        errors.push({ field: 'website', message: 'Please enter a valid website URL starting with http:// or https://' });
    }
    if (req.body.description && req.body.description.length > 1000) {
        errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    req.body.categories = categories;
    req.body.serviceRadius = serviceRadius;
    req.body.pickupService = pickupService;
    return next();
};
exports.validateNGORegistration = validateNGORegistration;
const validateNGOUpdate = (req, res, next) => {
    const { organizationName, categories, serviceRadius, website, description } = req.body;
    const errors = [];
    if (organizationName !== undefined) {
        if (!organizationName) {
            errors.push({ field: 'organizationName', message: 'Organization name cannot be empty' });
        }
        else if (organizationName.length > 200) {
            errors.push({ field: 'organizationName', message: 'Organization name cannot exceed 200 characters' });
        }
    }
    if (categories !== undefined) {
        const validCategories = ['food', 'clothing', 'education', 'healthcare', 'books', 'electronics'];
        if (!Array.isArray(categories)) {
            errors.push({ field: 'categories', message: 'Categories must be an array' });
        }
        else if (categories.length === 0) {
            errors.push({ field: 'categories', message: 'At least one category must be selected' });
        }
        else {
            const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
            if (invalidCategories.length > 0) {
                errors.push({
                    field: 'categories',
                    message: `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${validCategories.join(', ')}`
                });
            }
        }
    }
    if (serviceRadius !== undefined) {
        if (typeof serviceRadius !== 'number' || serviceRadius < 1 || serviceRadius > 100) {
            errors.push({ field: 'serviceRadius', message: 'Service radius must be a number between 1 and 100 km' });
        }
    }
    if (website !== undefined && website && !/^https?:\/\/.+/.test(website)) {
        errors.push({ field: 'website', message: 'Please enter a valid website URL starting with http:// or https://' });
    }
    if (description !== undefined && description && description.length > 1000) {
        errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validateNGOUpdate = validateNGOUpdate;
const validateDonation = (req, res, next) => {
    let { title, category, location, pickupOption, foodExpiry, amount } = req.body;
    const errors = [];
    if (typeof location === 'string') {
        try {
            location = JSON.parse(location);
        }
        catch (error) {
            errors.push({ field: 'location', message: 'Invalid location data format' });
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Please fix the following validation errors',
                    details: errors
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    if (!title) {
        errors.push({ field: 'title', message: 'Title is required' });
    }
    else if (title.length > 200) {
        errors.push({ field: 'title', message: 'Title cannot exceed 200 characters' });
    }
    const validCategories = ['food', 'clothing', 'books', 'electronics', 'financial', 'other'];
    if (!category) {
        errors.push({ field: 'category', message: 'Category is required' });
    }
    else if (!validCategories.includes(category)) {
        errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
    }
    if (!location) {
        errors.push({ field: 'location', message: 'Location is required' });
    }
    else {
        if (!location.address) {
            errors.push({ field: 'location.address', message: 'Address is required' });
        }
        else if (location.address.length > 300) {
            errors.push({ field: 'location.address', message: 'Address cannot exceed 300 characters' });
        }
        if (!location.coordinates) {
            errors.push({ field: 'location.coordinates', message: 'Coordinates are required' });
        }
        else {
            const { lat, lng } = location.coordinates;
            if (lat === undefined || lat === null) {
                errors.push({ field: 'location.coordinates.lat', message: 'Latitude is required' });
            }
            else if (lat < -90 || lat > 90) {
                errors.push({ field: 'location.coordinates.lat', message: 'Latitude must be between -90 and 90' });
            }
            if (lng === undefined || lng === null) {
                errors.push({ field: 'location.coordinates.lng', message: 'Longitude is required' });
            }
            else if (lng < -180 || lng > 180) {
                errors.push({ field: 'location.coordinates.lng', message: 'Longitude must be between -180 and 180' });
            }
        }
    }
    const validPickupOptions = ['pickup', 'dropoff', 'both'];
    if (!pickupOption) {
        errors.push({ field: 'pickupOption', message: 'Pickup option is required' });
    }
    else if (!validPickupOptions.includes(pickupOption)) {
        errors.push({ field: 'pickupOption', message: `Pickup option must be one of: ${validPickupOptions.join(', ')}` });
    }
    if (category === 'food') {
        if (!foodExpiry) {
            errors.push({ field: 'foodExpiry', message: 'Food expiry date is required for food donations' });
        }
        else {
            const expiryDate = new Date(foodExpiry);
            const now = new Date();
            const maxExpiry = new Date(now.getTime() + (3 * 60 * 60 * 1000));
            if (isNaN(expiryDate.getTime())) {
                errors.push({ field: 'foodExpiry', message: 'Invalid expiry date format' });
            }
            else if (expiryDate <= now) {
                errors.push({ field: 'foodExpiry', message: 'Food expiry date must be in the future' });
            }
            else if (expiryDate <= maxExpiry) {
                errors.push({ field: 'foodExpiry', message: 'Food expiry date must be more than 3 hours from now' });
            }
        }
    }
    if (category === 'financial') {
        if (!amount) {
            errors.push({ field: 'amount', message: 'Amount is required for financial donations' });
        }
        else if (typeof amount !== 'number' || amount <= 0) {
            errors.push({ field: 'amount', message: 'Amount must be a positive number' });
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    req.body.location = location;
    return next();
};
exports.validateDonation = validateDonation;
const validateNGOVerification = (req, res, next) => {
    const { badge } = req.body;
    const errors = [];
    if (badge !== undefined) {
        const validBadges = ['bronze', 'silver', 'gold', 'platinum'];
        if (!validBadges.includes(badge)) {
            errors.push({
                field: 'badge',
                message: `Badge must be one of: ${validBadges.join(', ')}`
            });
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validateNGOVerification = validateNGOVerification;
const validateNGORejection = (req, res, next) => {
    const { reason } = req.body;
    const errors = [];
    if (!reason) {
        errors.push({ field: 'reason', message: 'Rejection reason is required' });
    }
    else if (typeof reason !== 'string') {
        errors.push({ field: 'reason', message: 'Rejection reason must be a string' });
    }
    else if (reason.trim().length === 0) {
        errors.push({ field: 'reason', message: 'Rejection reason cannot be empty' });
    }
    else if (reason.length > 500) {
        errors.push({ field: 'reason', message: 'Rejection reason cannot exceed 500 characters' });
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validateNGORejection = validateNGORejection;
const validateBadgeUpdate = (req, res, next) => {
    const { badge } = req.body;
    const errors = [];
    if (!badge) {
        errors.push({ field: 'badge', message: 'Badge is required' });
    }
    else {
        const validBadges = ['bronze', 'silver', 'gold', 'platinum'];
        if (!validBadges.includes(badge)) {
            errors.push({
                field: 'badge',
                message: `Badge must be one of: ${validBadges.join(', ')}`
            });
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Please fix the following validation errors',
                details: errors
            },
            timestamp: new Date().toISOString()
        });
    }
    return next();
};
exports.validateBadgeUpdate = validateBadgeUpdate;
//# sourceMappingURL=validation.js.map