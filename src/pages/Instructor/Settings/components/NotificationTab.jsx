import React, { useState } from 'react';

const NotificationTab = () => {
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    exam_reminders: true,
    student_submissions: false,
    system_updates: true,
    grade_notifications: true,
    question_bank_updates: false,
    subject_updates: true,
    maintenance_alerts: true
  });

  const [emailSettings, setEmailSettings] = useState({
    frequency: 'immediate',
    digest: false,
    marketing: false
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEmailSettingChange = (key, value) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving notification settings...', { notifications, emailSettings });
    alert('Cài đặt thông báo đã được lưu!');
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Cài đặt thông báo</h2>
        <p>Quản lý các loại thông báo bạn muốn nhận</p>
      </div>

      {/* Email Notifications */}
      <div className="notification-section">
        <h3>Thông báo Email</h3>
        <div className="notification-options">
          <div className="notification-option">
            <div className="option-info">
              <h4>Thông báo chung</h4>
              <p>Nhận email về các hoạt động quan trọng</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.email_notifications}
                onChange={() => handleNotificationChange('email_notifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Nhắc nhở kỳ thi</h4>
              <p>Nhận thông báo trước khi kỳ thi bắt đầu</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.exam_reminders}
                onChange={() => handleNotificationChange('exam_reminders')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Bài nộp của sinh viên</h4>
              <p>Thông báo khi sinh viên nộp bài thi</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.student_submissions}
                onChange={() => handleNotificationChange('student_submissions')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Cập nhật hệ thống</h4>
              <p>Thông báo về các tính năng mới và cập nhật</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.system_updates}
                onChange={() => handleNotificationChange('system_updates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Thông báo điểm số</h4>
              <p>Nhận thông báo khi có cập nhật điểm số</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.grade_notifications}
                onChange={() => handleNotificationChange('grade_notifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Cập nhật ngân hàng câu hỏi</h4>
              <p>Thông báo khi có thay đổi trong ngân hàng câu hỏi</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.question_bank_updates}
                onChange={() => handleNotificationChange('question_bank_updates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Cập nhật môn học</h4>
              <p>Thông báo về các thay đổi trong môn học</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.subject_updates}
                onChange={() => handleNotificationChange('subject_updates')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Cảnh báo bảo trì</h4>
              <p>Thông báo về lịch bảo trì hệ thống</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.maintenance_alerts}
                onChange={() => handleNotificationChange('maintenance_alerts')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="notification-section">
        <h3>Cài đặt Email</h3>
        <div className="email-settings">
          <div className="form-group">
            <label>Tần suất gửi email</label>
            <select
              className="form-input"
              value={emailSettings.frequency}
              onChange={(e) => handleEmailSettingChange('frequency', e.target.value)}
            >
              <option value="immediate">Ngay lập tức</option>
              <option value="hourly">Mỗi giờ</option>
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
            </select>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Email tổng hợp</h4>
              <p>Nhận email tổng hợp các hoạt động trong ngày</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailSettings.digest}
                onChange={(e) => handleEmailSettingChange('digest', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="notification-option">
            <div className="option-info">
              <h4>Email marketing</h4>
              <p>Nhận thông tin về các tính năng mới và khuyến mãi</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailSettings.marketing}
                onChange={(e) => handleEmailSettingChange('marketing', e.target.checked)}
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
        <button className="btn btn-secondary">
          Khôi phục mặc định
        </button>
      </div>
    </div>
  );
};

export default NotificationTab;