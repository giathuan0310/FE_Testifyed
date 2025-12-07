import React, { useState } from 'react';
import { useAppStore } from '../../../../store/appStore';
import { updatePasswordApi } from '../../../../service/api/apiUser';
import { toast } from "react-toastify";

const SecurityTab = () => {
  const user = useAppStore(state => state.user);

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [isChanging, setIsChanging] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: '30',
    allowMultipleSessions: false
  });

  const calculatePasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Vui lòng nhập đủ thông tin!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    setIsChanging(true);
    try {
      await updatePasswordApi(user.code, passwordData.newPassword);
      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Change password error:', err);
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setIsChanging(false);
    }
  };

  const renderPasswordStrength = () => (
    <div className="password-strength">
      <h5>Độ mạnh mật khẩu</h5>
      <div className="strength-bars">
        <div className={`strength-bar ${passwordStrength === 'weak' || passwordStrength === 'medium' || passwordStrength === 'strong' ? 'active weak' : ''}`}></div>
        <div className={`strength-bar ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'active medium' : ''}`}></div>
        <div className={`strength-bar ${passwordStrength === 'strong' ? 'active strong' : ''}`}></div>
      </div>
      <p className="strength-text">
        Mật khẩu {passwordStrength === 'weak' ? 'yếu' : passwordStrength === 'medium' ? 'trung bình' : 'mạnh'}
      </p>
    </div>
  );

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Bảo mật tài khoản</h2>
        <p>Quản lý mật khẩu và các cài đặt bảo mật</p>
      </div>

      {/* Change Password Section */}
      <div className="security-section">
        <h3>Đổi mật khẩu</h3>
        <div className="password-form">
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
            {passwordData.newPassword && renderPasswordStrength()}
          </div>
          <div className="form-group">
            <label>Nhập lại mật khẩu mới</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleChangePassword}
            disabled={isChanging}
          >
            {isChanging ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="security-section">
        <h3>Cài đặt bảo mật</h3>
        <div className="security-options">
          <div className="toggle-group">
            <div className="toggle-info">
              <h4>Xác thực hai yếu tố (2FA)</h4>
              <p>Thêm lớp bảo mật bằng mã xác thực từ điện thoại</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="toggle-group">
            <div className="toggle-info">
              <h4>Thông báo đăng nhập</h4>
              <p>Nhận email khi có đăng nhập từ thiết bị mới</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={securitySettings.loginNotifications}
                onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="toggle-group">
            <div className="toggle-info">
              <h4>Cho phép nhiều phiên đăng nhập</h4>
              <p>Đăng nhập đồng thời trên nhiều thiết bị</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={securitySettings.allowMultipleSessions}
                onChange={(e) => handleSecurityChange('allowMultipleSessions', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="toggle-group">
            <div className="toggle-info">
              <h4>Thời gian hết hạn phiên</h4>
              <p>Tự động đăng xuất sau khoảng thời gian không hoạt động</p>
            </div>
            <select
              className="form-input"
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="15">15 phút</option>
              <option value="30">30 phút</option>
              <option value="60">1 giờ</option>
              <option value="120">2 giờ</option>
              <option value="0">Không tự động đăng xuất</option>
            </select>
          </div>
        </div>
      </div>

      <div className="section-actions">
        <button className="btn btn-primary">
          Lưu cài đặt bảo mật
        </button>
      </div>
    </div>
  );
};

export default SecurityTab;