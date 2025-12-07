import React, { useState, useEffect } from 'react';
import { X, Upload, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import './UserForm.css';

const UserForm = ({ user, isOpen, onClose, onSubmit, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    email: '',
    gender: 'Nam',
    role: 'STUDENT',
    passwordHash: '',
    confirmPassword: '',
    avatar: null
  });
  
  const [avatarPreview, setAvatarPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        code: user.code || '',
        fullName: user.fullName || '',
        email: user.email || '',
        gender: user.gender || 'Nam',
        role: user.role || 'STUDENT',
        passwordHash: '',
        confirmPassword: '',
        avatar: null
      });
      setAvatarPreview(user.avatar || '');
    } else {
      // Reset form for add mode
      setFormData({
        code: '',
        fullName: '',
        email: '',
        gender: 'Nam',
        role: 'STUDENT',
        passwordHash: '',
        confirmPassword: '',
        avatar: null
      });
      setAvatarPreview('');
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        avatar: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password validation for add mode or when password is entered in edit mode
    if (mode === 'add' || formData.passwordHash) {
      if (!formData.passwordHash) {
        newErrors.passwordHash = 'Mật khẩu là bắt buộc';
      } else if (formData.passwordHash.length < 6) {
        newErrors.passwordHash = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (formData.passwordHash !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
      }
    }

    // Code validation for add mode
    if (mode === 'add' && formData.code && !/^\d{8}$/.test(formData.code)) {
      newErrors.code = 'Mã số phải gồm 8 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'avatar' && formData[key]) {
          submitData.append('avatar', formData[key]);
        } else if (key === 'confirmPassword') {
          // Skip confirmPassword
          return;
        } else if (key === 'passwordHash' && mode === 'edit' && !formData[key]) {
          // Skip empty password in edit mode
          return;
        } else {
          submitData.append(key, formData[key]);
        }
      });

      await onSubmit(submitData, mode);
      onClose();
      toast.success(mode === 'add' ? 'Thêm người dùng thành công' : 'Cập nhật người dùng thành công');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-form-overlay">
      <div className="user-form-modal">
        <div className="user-form-header">
          <h2>{mode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            {/* Avatar Upload */}
            <div className="form-group avatar-upload">
              <label>Ảnh đại diện</label>
              <div className="avatar-upload-area">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
                ) : (
                  <div className="avatar-placeholder">
                    <Upload size={32} />
                    <span>Chọn ảnh</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-input"
                />
              </div>
            </div>

            {/* Code */}
            <div className="form-group">
              <label htmlFor="code">
                Mã số {mode === 'add' && '*'}
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder={mode === 'add' ? "Để trống để tự động tạo" : "Không thể thay đổi"}
                disabled={mode === 'edit'}
                className={errors.code ? 'error' : ''}
              />
              {errors.code && <span className="error-message">{errors.code}</span>}
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender">Giới tính</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            {/* Role */}
            <div className="form-group">
              <label htmlFor="role">Vai trò</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="STUDENT">Sinh viên</option>
                <option value="INSTRUCTOR">Giảng viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="passwordHash">
                Mật khẩu {mode === 'add' ? '*' : '(để trống nếu không đổi)'}
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="passwordHash"
                  name="passwordHash"
                  value={formData.passwordHash}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className={errors.passwordHash ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.passwordHash && <span className="error-message">{errors.passwordHash}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Xác nhận mật khẩu {(mode === 'add' || formData.passwordHash) ? '*' : ''}
              </label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : (mode === 'add' ? 'Thêm người dùng' : 'Cập nhật')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;