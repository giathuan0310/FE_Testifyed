import React, { useState } from 'react';
import { FiUser, FiLock, FiBell, FiGlobe } from 'react-icons/fi';
import { ProfileTab, SecurityTab, NotificationTab, PreferencesTab } from './components';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: FiUser },
    { id: 'security', label: 'Bảo mật', icon: FiLock },
    { id: 'notifications', label: 'Thông báo', icon: FiBell },
    { id: 'preferences', label: 'Tùy chọn', icon: FiGlobe }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return <NotificationTab />;
      case 'preferences':
        return <PreferencesTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Cài đặt tài khoản</h1>
        <p>Quản lý thông tin cá nhân và tùy chọn hệ thống</p>
      </div>

      {/* Tab Navigation */}
      <div className="settings-nav">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="settings-content">
        {/* Tab Content */}
        <div className="settings-main">
          {renderTabContent()}
        </div>


      </div>
    </div>
  );
};

export default Settings;
