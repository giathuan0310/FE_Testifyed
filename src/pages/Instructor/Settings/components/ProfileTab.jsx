import React, { useEffect, useState } from 'react';
import { FiCamera, FiTrash2 } from 'react-icons/fi';
import { useAppStore } from '../../../../store/appStore';
import { updateProfileApi, updatePasswordApi } from '../../../../service/api/apiUser';
import { toast } from "react-toastify";

const ProfileTab = () => {
  const user = useAppStore(state => state.user);
  const setUser = useAppStore(state => state.setUser);

  const [formData, setFormData] = useState({
    code: user?.code || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    gender: user?.gender || '',
    Role: user?.role || '',
    status: user?.isActive || false,
    bio: user?.bio || 'Giảng viên với 10 năm kinh nghiệm trong lĩnh vực phát triển phần mềm và cơ sở dữ liệu.',
  });

  // Avatar handling
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);

  // Đổi mật khẩu
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  // Loading state
  const [isUpdating, setIsUpdating] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        code: user?.code || '',
        fullName: user?.fullName || '',
        email: user?.email || '',
        gender: user?.gender || '',
        Role: user?.role || '',
        status: user?.isActive || false,
        bio: user?.bio || 'Giảng viên với 10 năm kinh nghiệm trong lĩnh vực phát triển phần mềm và cơ sở dữ liệu.',
      });
      setAvatarPreview(user?.avatar || '');
    }
  }, [user]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB!");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file hình ảnh!");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };



  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save profile - chỉ gửi fullName và email
  const handleSave = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên!");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    setIsUpdating(true);
    try {
      const formDataToSend = new FormData();
      // Chỉ gửi các trường trong database: fullName và email
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);

      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const res = await updateProfileApi(user.code, formDataToSend);
      toast.success("Cập nhật thông tin thành công!");
      if (res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      code: user?.code || '',
      fullName: user?.fullName || '',
      email: user?.email || '',
      gender: user?.gender || '',
      Role: user?.role || '',
      status: user?.isActive || false,
      bio: user?.bio || 'Giảng viên với 10 năm kinh nghiệm trong lĩnh vực phát triển phần mềm và cơ sở dữ liệu.',
    });
    setAvatarPreview(user?.avatar || '');
    setAvatarFile(null);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Thông tin cá nhân</h2>
        <p>Cập nhật thông tin cá nhân và avatar của bạn</p>
      </div>

      {/* Profile Image Section */}
      <div className="profile-image-section">
        <div className="profile-avatar">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="profile-avatar-image" />
          ) : (
            <span>{user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}</span>
          )}

        </div>
        <div className="avatar-actions">
          <label className="btn btn-secondary">
            <FiCamera size={16} />
            Đổi ảnh
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </label>

        </div>
      </div>

      {/* Profile Form */}
      <div className="profile-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Mã giảng viên</label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              disabled
              placeholder="Mã giảng viên"
            />
          </div>
          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              className="form-input"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Nhập email"
            />
          </div>
          <div className="form-group">
            <label>Giới tính</label>
            <select
              className="form-input"
              value={formData.gender}
              disabled
            >
              <option value="">Chưa cập nhật</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className="form-group">
            <label>Vai trò</label>
            <input
              type="text"
              className="form-input"
              value={formData.Role}
              disabled
              placeholder="Vai trò trong hệ thống"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Trạng thái hoạt động</label>
          <div className="status-display">
            <span className={`status-badge ${formData.status ? 'active' : 'inactive'}`}>
              {formData.status ? '🟢 Đang hoạt động' : '🔴 Không hoạt động'}
            </span>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Giới thiệu bản thân</label>
          <textarea
            className="form-input form-textarea"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            placeholder="Mô tả ngắn về bản thân, kinh nghiệm và chuyên môn..."
            disabled
          />
        </div>
      </div>

      <div className="section-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={isUpdating}
        >
          Hủy
        </button>
      </div>


    </div>
  );
};

export default ProfileTab;