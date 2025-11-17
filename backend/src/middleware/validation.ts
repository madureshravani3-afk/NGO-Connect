import { Request, Response, NextFunction } from 'express';

// Validation error interface
interface ValidationError {
  field: string;
  message: string;
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  return Boolean(password && password.length >= 6);
};

// Phone validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};

// Pincode validation
export const isValidPincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

// Registration validation middleware
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, role, profile } = req.body;
  const errors: ValidationError[] = [];

  // Email validation
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Password validation
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isValidPassword(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  // Role validation
  if (!role) {
    errors.push({ field: 'role', message: 'Role is required' });
  } else if (!['donor', 'ngo', 'admin'].includes(role)) {
    errors.push({ field: 'role', message: 'Role must be donor, ngo, or admin' });
  }

  // Profile validation
  if (!profile) {
    errors.push({ field: 'profile', message: 'Profile information is required' });
  } else {
    if (!profile.firstName) {
      errors.push({ field: 'profile.firstName', message: 'First name is required' });
    } else if (profile.firstName.length > 50) {
      errors.push({ field: 'profile.firstName', message: 'First name cannot exceed 50 characters' });
    }

    if (!profile.lastName) {
      errors.push({ field: 'profile.lastName', message: 'Last name is required' });
    } else if (profile.lastName.length > 50) {
      errors.push({ field: 'profile.lastName', message: 'Last name cannot exceed 50 characters' });
    }

    // Optional phone validation
    if (profile.phone && !isValidPhone(profile.phone)) {
      errors.push({ field: 'profile.phone', message: 'Please enter a valid phone number' });
    }

    // Optional address validation
    if (profile.address) {
      if (profile.address.pincode && !isValidPincode(profile.address.pincode)) {
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

// Login validation middleware
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email)) {
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

// Profile update validation middleware
export const validateProfileUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { profile } = req.body;
  const errors: ValidationError[] = [];

  if (profile) {
    if (profile.firstName !== undefined) {
      if (!profile.firstName) {
        errors.push({ field: 'profile.firstName', message: 'First name cannot be empty' });
      } else if (profile.firstName.length > 50) {
        errors.push({ field: 'profile.firstName', message: 'First name cannot exceed 50 characters' });
      }
    }

    if (profile.lastName !== undefined) {
      if (!profile.lastName) {
        errors.push({ field: 'profile.lastName', message: 'Last name cannot be empty' });
      } else if (profile.lastName.length > 50) {
        errors.push({ field: 'profile.lastName', message: 'Last name cannot exceed 50 characters' });
      }
    }

    if (profile.phone !== undefined && profile.phone && !isValidPhone(profile.phone)) {
      errors.push({ field: 'profile.phone', message: 'Please enter a valid phone number' });
    }

    if (profile.address) {
      if (profile.address.pincode && !isValidPincode(profile.address.pincode)) {
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

// Password reset validation middleware
export const validatePasswordReset = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email)) {
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

// New password validation middleware
export const validateNewPassword = (req: Request, res: Response, next: NextFunction) => {
  const { password, confirmPassword } = req.body;
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isValidPassword(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Password confirmation is required' });
  } else if (password !== confirmPassword) {
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

// NGO registration validation middleware
export const validateNGORegistration = (req: Request, res: Response, next: NextFunction) => {
  let { organizationName, registrationNumber, categories, serviceRadius, website, pickupService } = req.body;
  const errors: ValidationError[] = [];

  // Parse categories if it's a JSON string (from FormData)
  if (typeof categories === 'string') {
    try {
      categories = JSON.parse(categories);
    } catch (error) {
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

  // Parse serviceRadius if it's a string
  if (typeof serviceRadius === 'string') {
    serviceRadius = parseFloat(serviceRadius);
  }

  // Parse pickupService if it's a string
  if (typeof pickupService === 'string') {
    pickupService = pickupService === 'true';
  }

  // Organization name validation
  if (!organizationName) {
    errors.push({ field: 'organizationName', message: 'Organization name is required' });
  } else if (organizationName.length > 200) {
    errors.push({ field: 'organizationName', message: 'Organization name cannot exceed 200 characters' });
  }

  // Registration number validation
  if (!registrationNumber) {
    errors.push({ field: 'registrationNumber', message: 'Registration number is required' });
  } else if (registrationNumber.length > 50) {
    errors.push({ field: 'registrationNumber', message: 'Registration number cannot exceed 50 characters' });
  }

  // Categories validation
  const validCategories = ['food', 'clothing', 'education', 'healthcare', 'books', 'electronics'];
  if (!categories || !Array.isArray(categories)) {
    errors.push({ field: 'categories', message: 'Categories are required and must be an array' });
  } else if (categories.length === 0) {
    errors.push({ field: 'categories', message: 'At least one category must be selected' });
  } else {
    const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      errors.push({ 
        field: 'categories', 
        message: `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${validCategories.join(', ')}` 
      });
    }
  }

  // Service radius validation (optional)
  if (serviceRadius !== undefined) {
    if (typeof serviceRadius !== 'number' || serviceRadius < 1 || serviceRadius > 100) {
      errors.push({ field: 'serviceRadius', message: 'Service radius must be a number between 1 and 100 km' });
    }
  }

  // Website validation (optional)
  if (website && !/^https?:\/\/.+/.test(website)) {
    errors.push({ field: 'website', message: 'Please enter a valid website URL starting with http:// or https://' });
  }

  // Description validation (optional)
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

  // Update req.body with parsed values for the controller
  req.body.categories = categories;
  req.body.serviceRadius = serviceRadius;
  req.body.pickupService = pickupService;

  return next();
};

// NGO profile update validation middleware
export const validateNGOUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { organizationName, categories, serviceRadius, website, description } = req.body;
  const errors: ValidationError[] = [];

  // Organization name validation (optional for updates)
  if (organizationName !== undefined) {
    if (!organizationName) {
      errors.push({ field: 'organizationName', message: 'Organization name cannot be empty' });
    } else if (organizationName.length > 200) {
      errors.push({ field: 'organizationName', message: 'Organization name cannot exceed 200 characters' });
    }
  }

  // Categories validation (optional for updates)
  if (categories !== undefined) {
    const validCategories = ['food', 'clothing', 'education', 'healthcare', 'books', 'electronics'];
    if (!Array.isArray(categories)) {
      errors.push({ field: 'categories', message: 'Categories must be an array' });
    } else if (categories.length === 0) {
      errors.push({ field: 'categories', message: 'At least one category must be selected' });
    } else {
      const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        errors.push({ 
          field: 'categories', 
          message: `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${validCategories.join(', ')}` 
        });
      }
    }
  }

  // Service radius validation (optional)
  if (serviceRadius !== undefined) {
    if (typeof serviceRadius !== 'number' || serviceRadius < 1 || serviceRadius > 100) {
      errors.push({ field: 'serviceRadius', message: 'Service radius must be a number between 1 and 100 km' });
    }
  }

  // Website validation (optional)
  if (website !== undefined && website && !/^https?:\/\/.+/.test(website)) {
    errors.push({ field: 'website', message: 'Please enter a valid website URL starting with http:// or https://' });
  }

  // Description validation (optional)
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

// Donation validation middleware
export const validateDonation = (req: Request, res: Response, next: NextFunction) => {
  let { title, category, location, pickupOption, foodExpiry, amount } = req.body;
  const errors: ValidationError[] = [];

  // Parse location if it's a JSON string (from FormData)
  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
    } catch (error) {
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

  // Title validation
  if (!title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (title.length > 200) {
    errors.push({ field: 'title', message: 'Title cannot exceed 200 characters' });
  }

  // Category validation
  const validCategories = ['food', 'clothing', 'books', 'electronics', 'financial', 'other'];
  if (!category) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (!validCategories.includes(category)) {
    errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
  }

  // Location validation
  if (!location) {
    errors.push({ field: 'location', message: 'Location is required' });
  } else {
    if (!location.address) {
      errors.push({ field: 'location.address', message: 'Address is required' });
    } else if (location.address.length > 300) {
      errors.push({ field: 'location.address', message: 'Address cannot exceed 300 characters' });
    }

    if (!location.coordinates) {
      errors.push({ field: 'location.coordinates', message: 'Coordinates are required' });
    } else {
      const { lat, lng } = location.coordinates;
      if (lat === undefined || lat === null) {
        errors.push({ field: 'location.coordinates.lat', message: 'Latitude is required' });
      } else if (lat < -90 || lat > 90) {
        errors.push({ field: 'location.coordinates.lat', message: 'Latitude must be between -90 and 90' });
      }

      if (lng === undefined || lng === null) {
        errors.push({ field: 'location.coordinates.lng', message: 'Longitude is required' });
      } else if (lng < -180 || lng > 180) {
        errors.push({ field: 'location.coordinates.lng', message: 'Longitude must be between -180 and 180' });
      }
    }
  }

  // Pickup option validation
  const validPickupOptions = ['pickup', 'dropoff', 'both'];
  if (!pickupOption) {
    errors.push({ field: 'pickupOption', message: 'Pickup option is required' });
  } else if (!validPickupOptions.includes(pickupOption)) {
    errors.push({ field: 'pickupOption', message: `Pickup option must be one of: ${validPickupOptions.join(', ')}` });
  }

  // Food expiry validation
  if (category === 'food') {
    if (!foodExpiry) {
      errors.push({ field: 'foodExpiry', message: 'Food expiry date is required for food donations' });
    } else {
      const expiryDate = new Date(foodExpiry);
      const now = new Date();
      const maxExpiry = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // 3 hours from now

      if (isNaN(expiryDate.getTime())) {
        errors.push({ field: 'foodExpiry', message: 'Invalid expiry date format' });
      } else if (expiryDate <= now) {
        errors.push({ field: 'foodExpiry', message: 'Food expiry date must be in the future' });
      } else if (expiryDate <= maxExpiry) {
        errors.push({ field: 'foodExpiry', message: 'Food expiry date must be more than 3 hours from now' });
      }
    }
  }

  // Financial donation amount validation
  if (category === 'financial') {
    if (!amount) {
      errors.push({ field: 'amount', message: 'Amount is required for financial donations' });
    } else if (typeof amount !== 'number' || amount <= 0) {
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

  // Update req.body with parsed location for the controller
  req.body.location = location;

  return next();
};

// Admin NGO verification validation middleware
export const validateNGOVerification = (req: Request, res: Response, next: NextFunction) => {
  const { badge } = req.body;
  const errors: ValidationError[] = [];

  // Badge validation (optional)
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

// Admin NGO rejection validation middleware
export const validateNGORejection = (req: Request, res: Response, next: NextFunction) => {
  const { reason } = req.body;
  const errors: ValidationError[] = [];

  // Reason validation
  if (!reason) {
    errors.push({ field: 'reason', message: 'Rejection reason is required' });
  } else if (typeof reason !== 'string') {
    errors.push({ field: 'reason', message: 'Rejection reason must be a string' });
  } else if (reason.trim().length === 0) {
    errors.push({ field: 'reason', message: 'Rejection reason cannot be empty' });
  } else if (reason.length > 500) {
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

// Admin badge update validation middleware
export const validateBadgeUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { badge } = req.body;
  const errors: ValidationError[] = [];

  // Badge validation
  if (!badge) {
    errors.push({ field: 'badge', message: 'Badge is required' });
  } else {
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