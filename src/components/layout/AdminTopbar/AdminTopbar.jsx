import React, { useState } from 'react';
import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import './AdminTopbar.css';

const AdminTopbar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAppStore(state => state.user);

  const getInitials = (name) => {
    if (!name) return "";
    return name.trim().split(" ").map(word => word[0]).join("").toUpperCase();
  };

  const notifications = [
    { id: 1, title: '5 sinh viên mới đăng ký', time: '2 giờ trước', unread: true },
    { id: 2, title: 'Kỳ thi mới được tạo', time: '4 giờ trước', unread: true },
    { id: 3, title: 'Báo cáo hệ thống', time: '1 ngày trước', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="admin-topbar">
      <div className="topbar-left">
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Menu size={20} />
        </button>
        
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <div className="notification-container">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Thông báo</h4>
                <span className="notification-count">{unreadCount} mới</span>
              </div>
              <div className="notification-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <div className="notification-content">
                      <p>{notification.title}</p>
                      <span>{notification.time}</span>
                    </div>
                    {notification.unread && <div className="unread-dot"></div>}
                  </div>
                ))}
              </div>
              <div className="notification-footer">
                <button>Xem tất cả</button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="user-profile-topbar">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <span>{getInitials(user?.fullName)}</span>
            )}
          </div>
          <div className="user-info-topbar">
            <span className="user-name">{user?.fullName}</span>
            <span className="user-role">Administrator</span>
          </div>
          <ChevronDown size={16} className="dropdown-arrow" />
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;