import React from 'react';

const SimpleAdminDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Tổng người dùng</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>150</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Giảng viên</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>25</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Lớp học</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>45</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Bài thi</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>120</p>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Hoạt động gần đây</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>✅ Tạo lớp học mới: "Toán cao cấp A1"</li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>👤 Thêm người dùng: Nguyễn Văn A</li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>📝 Tạo bài thi: "Kiểm tra giữa kỳ"</li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>🔧 Cập nhật hệ thống</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;