import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../../../service/api/apiUser';
import './LoginForm.css';
import { useAppStore } from '../../../store/appStore';
import { toast } from 'react-toastify';
const LoginForm = () => {
  const [formData, setFormData] = useState({
    code: '',
    password: ''
  });
  const setUser = useAppStore(state => state.setUser);
  const setIsAuthenticated = useAppStore(state => state.setIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy URL mà user muốn truy cập trước khi bị redirect đến login
  const from = location.state?.from?.pathname || '/student/dashboard';
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginApi(formData.code, formData.password);
      if (data.status) {
        setUser(data.data.user);
        setIsAuthenticated(true);
        toast.success('Đăng nhập thành công!');
        localStorage.setItem('accessToken', data.data.user.sessionToken); // lưu token

        // Redirect về trang ban đầu hoặc trang mặc định theo role
        if (data.data.user.role === "STUDENT") {
          navigate(from.startsWith('/student') ? from : "/student/dashboard");
        } else if (data.data.user.role === "INSTRUCTOR") {
          navigate(from.startsWith('/instructor') ? from : "/instructor/dashboard");
        } else if (data.data.user.role === "ADMIN") {
          navigate(from.startsWith('/admin') ? from : "/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      toast.error('Lỗi kết nối server!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">
          Đăng nhập vào Hệ Thống Kiểm Tra
          Trực Tuyến - Testifyed
        </h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Mã tài khoản"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mật khẩu"
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Đăng nhập
          </button>
        </form>
        <div className="forgot-password">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>
        <div className="footer-options">
          <div className="language-selector">
            <select>
              <option value="vi">Vietnamese (vi)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
          <button className="cookie-info">
            Thông báo về đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;