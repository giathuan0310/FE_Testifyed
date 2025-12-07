import React, { useState } from 'react';

const PreferencesTab = () => {
  const [preferences, setPreferences] = useState({
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    theme: 'light',
    autoSave: true,
    pageSize: '20',
    confirmActions: true,
    showTutorials: true
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving preferences...', preferences);
    alert('Tùy chọn đã được lưu!');
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục về cài đặt mặc định?')) {
      setPreferences({
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h',
        theme: 'light',
        autoSave: true,
        pageSize: '20',
        confirmActions: true,
        showTutorials: true
      });
    }
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Tùy chọn hiển thị</h2>
        <p>Cài đặt giao diện và tùy chọn sử dụng</p>
      </div>

      {/* Language & Region */}
      <div className="preferences-section">
        <h3>Ngôn ngữ & Khu vực</h3>
        <div className="preferences-grid">
          <div className="form-group">
            <label>Ngôn ngữ</label>
            <select
              className="form-input"
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div className="form-group">
            <label>Múi giờ</label>
            <select
              className="form-input"
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
            >
              <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="Europe/London">London (UTC+0)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Định dạng ngày</label>
            <select
              className="form-input"
              value={preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
            >
              <option value="dd/MM/yyyy">DD/MM/YYYY</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="form-group">
            <label>Định dạng giờ</label>
            <select
              className="form-input"
              value={preferences.timeFormat}
              onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
            >
              <option value="24h">24 giờ</option>
              <option value="12h">12 giờ (AM/PM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="preferences-section">
        <h3>Hiển thị</h3>
        <div className="preferences-grid">
          <div className="form-group">
            <label>Giao diện</label>
            <select
              className="form-input"
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            >
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
              <option value="auto">Tự động</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số mục trên trang</label>
            <select
              className="form-input"
              value={preferences.pageSize}
              onChange={(e) => handlePreferenceChange('pageSize', e.target.value)}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Behavior Preferences */}
      <div className="preferences-section">
        <h3>Hành vi</h3>
        <div className="preference-options">
          <div className="preference-option">
            <div className="option-info">
              <h4>Tự động lưu</h4>
              <p>Tự động lưu các thay đổi khi chỉnh sửa</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-option">
            <div className="option-info">
              <h4>Xác nhận hành động</h4>
              <p>Hiển thị hộp thoại xác nhận trước khi thực hiện hành động quan trọng</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.confirmActions}
                onChange={(e) => handlePreferenceChange('confirmActions', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-option">
            <div className="option-info">
              <h4>Hiển thị hướng dẫn</h4>
              <p>Hiện tooltip và hướng dẫn sử dụng</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.showTutorials}
                onChange={(e) => handlePreferenceChange('showTutorials', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="section-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Lưu cài đặt
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Khôi phục mặc định
        </button>
      </div>
    </div>
  );
};

export default PreferencesTab;