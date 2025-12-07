// utils/apiHelpers.js - Utility functions cho API responses

/**
 * Chuẩn hóa response từ API
 * @param {Object} response - Response từ API call
 * @returns {Object} - Normalized response với data array
 */
export const normalizeApiResponse = (response) => {
  // Xử lý các format response khác nhau
  if (response?.data) {
    return {
      success: true,
      status: true,
      data: Array.isArray(response.data) ? response.data : [response.data]
    };
  }
  
  if (response?.success !== undefined) {
    return {
      success: response.success,
      status: response.success,
      data: Array.isArray(response.data) ? response.data : (response.data ? [response.data] : [])
    };
  }
  
  if (response?.status !== undefined) {
    return {
      success: response.status,
      status: response.status,
      data: Array.isArray(response.data) ? response.data : (response.data ? [response.data] : [])
    };
  }
  
  // Fallback cho response không chuẩn
  return {
    success: false,
    status: false,
    data: [],
    error: 'Invalid response format'
  };
};

/**
 * Xử lý error từ API calls
 * @param {Error} error - Error object
 * @param {string} operation - Tên operation đang thực hiện
 * @returns {Object} - Standardized error response
 */
export const handleApiError = (error, operation = 'API call') => {
  console.error(`Error in ${operation}:`, error);
  
  const errorMessage = 
    error?.response?.data?.message || 
    error?.message || 
    `Lỗi khi thực hiện ${operation}`;
    
  return {
    success: false,
    status: false,
    data: [],
    error: errorMessage,
    statusCode: error?.response?.status || 500
  };
};

/**
 * Kiểm tra và lấy dữ liệu từ nested object
 * @param {Object} obj - Object cần kiểm tra
 * @param {string} path - Path đến property (vd: 'user.profile.name')
 * @param {any} defaultValue - Giá trị mặc định
 * @returns {any} - Giá trị tìm được hoặc default value
 */
export const safeGet = (obj, path, defaultValue = null) => {
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Format date cho hiển thị
 * @param {string|Date} date - Date string hoặc Date object
 * @param {string} locale - Locale string (default: 'vi-VN')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, locale = 'vi-VN') => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format datetime cho hiển thị
 * @param {string|Date} date - Date string hoặc Date object
 * @param {string} locale - Locale string (default: 'vi-VN')
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (date, locale = 'vi-VN') => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(locale);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Tạo options cho select dropdown từ array
 * @param {Array} items - Array items
 * @param {string} valueKey - Key cho value
 * @param {string} labelKey - Key cho label
 * @returns {Array} - Array options cho select
 */
export const createSelectOptions = (items = [], valueKey = '_id', labelKey = 'name') => {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => ({
    value: safeGet(item, valueKey, ''),
    label: safeGet(item, labelKey, 'Không xác định')
  }));
};

/**
 * Debounce function cho search
 * @param {Function} func - Function cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};