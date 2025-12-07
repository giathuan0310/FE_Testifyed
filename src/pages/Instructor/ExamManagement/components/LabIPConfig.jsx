import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiAlertCircle, FiWifi, FiSave } from 'react-icons/fi';
import './LabIPConfig.css';

const LabIPConfig = ({ examId, initialConfig, onSave, disabled = false }) => {
  const [enabled, setEnabled] = useState(initialConfig?.enabled || false);
  const [allowedIPs, setAllowedIPs] = useState(initialConfig?.allowedIPs || []);
  const [labName, setLabName] = useState(initialConfig?.labName || '');
  const [newIP, setNewIP] = useState('');
  const [blockedMessage, setBlockedMessage] = useState(
    initialConfig?.blockedMessage || 
    'Bạn phải kết nối mạng phòng Lab để làm bài thi này.'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddIP = () => {
    if (!newIP.trim()) return;
    
    if (!isValidIPFormat(newIP)) {
      alert('Định dạng IP không hợp lệ!\nVí dụ hợp lệ:\n- 192.168.1.0/24 (subnet)\n- 192.168.1.* (wildcard)\n- 192.168.1.100 (IP đơn)');
      return;
    }

    if (allowedIPs.includes(newIP)) {
      alert('IP này đã tồn tại trong danh sách!');
      return;
    }

    setAllowedIPs([...allowedIPs, newIP]);
    setNewIP('');
  };

  const handleRemoveIP = (ip) => {
    setAllowedIPs(allowedIPs.filter(item => item !== ip));
  };

  const handleSave = async () => {
    if (enabled && allowedIPs.length === 0) {
      alert('Vui lòng thêm ít nhất 1 IP/subnet cho phòng Lab!');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        enabled,
        allowedIPs,
        labName: labName.trim(),
        blockedMessage: blockedMessage.trim()
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isValidIPFormat = (str) => {
    // Wildcard: 192.168.1.*
    if (str.includes('*')) {
      return /^(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)$/.test(str);
    }
    
    // CIDR: 192.168.1.0/24
    if (str.includes('/')) {
      const [ip, bits] = str.split('/');
      const bitsNum = parseInt(bits);
      if (isNaN(bitsNum) || bitsNum < 0 || bitsNum > 32) return false;
      return /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ip);
    }
    
    // Single IP: 192.168.1.100
    return /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(str);
  };

  const getIPTypeLabel = (ip) => {
    if (ip.includes('/')) return 'Subnet (CIDR)';
    if (ip.includes('*')) return 'Wildcard';
    return 'IP đơn';
  };

  return (
    <div className="lab-ip-config">
      <div className="config-header">
        <div className="header-left">
          <FiWifi className="header-icon" />
          <div>
            <h3>Giới hạn IP phòng Lab</h3>
            <p className="header-subtitle">Chỉ cho phép làm bài từ mạng phòng Lab</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            disabled={disabled}
          />
          <span className="slider"></span>
        </label>
      </div>

      {enabled && (
        <>
          {/* Lab Name */}
          <div className="form-group">
            <label>Tên phòng Lab <span className="required">*</span></label>
            <input
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="VD: Phòng Lab A301, Phòng máy tầng 3..."
              className="input-text"
              disabled={disabled}
            />
          </div>

          {/* Alert */}
          <div className="alert alert-info">
            <FiAlertCircle />
            <div>
              <strong>Hướng dẫn nhập IP mạng phòng Lab:</strong>
              <ul>
                <li>
                  <strong>Subnet (CIDR):</strong> <code>192.168.1.0/24</code> 
                  <br/><small>→ Toàn bộ dải 192.168.1.1 đến 192.168.1.254</small>
                </li>
                <li>
                  <strong>Wildcard:</strong> <code>192.168.1.*</code>
                  <br/><small>→ Tất cả IP trong 192.168.1.x</small>
                </li>
                <li>
                  <strong>IP đơn:</strong> <code>192.168.1.100</code>
                  <br/><small>→ Chỉ IP cụ thể này</small>
                </li>
              </ul>
            </div>
          </div>

          {/* Add IP */}
          <div className="add-ip-section">
            <input
              type="text"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddIP()}
              placeholder="Nhập IP/subnet phòng Lab (VD: 192.168.1.0/24)"
              className="ip-input"
              disabled={disabled}
            />
            <button 
              onClick={handleAddIP} 
              className="btn btn-primary"
              disabled={disabled}
            >
              <FiPlus /> Thêm
            </button>
          </div>

          {/* IP List */}
          <div className="ip-list">
            <h4>Mạng phòng Lab được phép ({allowedIPs.length})</h4>
            {allowedIPs.length === 0 ? (
              <div className="empty-state">
                <FiWifi className="empty-icon" />
                <p>Chưa cấu hình mạng Lab nào</p>
                <small>Thêm IP/subnet của phòng Lab để giới hạn quyền làm bài</small>
              </div>
            ) : (
              <ul>
                {allowedIPs.map((ip, index) => (
                  <li key={index} className="ip-item">
                    <div className="ip-info">
                      <code>{ip}</code>
                      <span className="ip-type">{getIPTypeLabel(ip)}</span>
                    </div>
                    {!disabled && (
                      <button
                        onClick={() => handleRemoveIP(ip)}
                        className="btn-remove"
                        title="Xóa"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Blocked Message */}
          <div className="form-group">
            <label>Thông báo khi IP không hợp lệ</label>
            <textarea
              value={blockedMessage}
              onChange={(e) => setBlockedMessage(e.target.value)}
              rows={3}
              className="textarea"
              placeholder="Nhập thông báo hiển thị cho sinh viên khi không ở phòng Lab..."
              disabled={disabled}
            />
          </div>

          {/* Actions */}
          {!disabled && (
            <div className="config-actions">
              <button 
                onClick={handleSave} 
                className="btn btn-success"
                disabled={isSaving}
              >
                <FiSave />
                {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LabIPConfig;