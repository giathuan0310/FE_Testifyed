import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordForm.css';
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from '../../../service/api/apiUser';
import { toast } from 'react-toastify';
const ForgotPasswordForm = () => {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP, 3: nhập pass mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Bước 1: gửi OTP về email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await forgotPasswordApi(email);
      if (res.status) {
        setStep(2);
      } else {
        alert(res.message || "Gửi OTP thất bại!");
      }
    } catch {
      alert("Lỗi kết nối server!");
    }
    setLoading(false);
  };

  // Bước 2: xác minh OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    try {
      const res = await verifyOtpApi(email, otp);
      if (res.status) {
        setStep(3);
      } else {
        alert(res.message || "OTP không hợp lệ!");
      }
    } catch {
      alert("Lỗi kết nối server!");
    }
    setLoading(false);
  };

  // Bước 3: đặt lại mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim() || !confirmPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordApi(email, newPassword);
      if (res.status) {
        setStep(4);
      } else {
        toast.error(res.message || "Đặt lại mật khẩu thất bại!");
      }
    } catch {
      toast.error("Lỗi kết nối server!");
    }
    setLoading(false);
  };

  // Giao diện từng bước
  if (step === 4) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <div className="success-icon">✓</div>
          <h1 className="forgot-password-title">
            Đặt lại mật khẩu thành công!
          </h1>
          <div className="success-message">
            <p>
              Bạn đã đặt lại mật khẩu cho tài khoản <strong>{email}</strong>.
            </p>
            <p>
              Vui lòng đăng nhập lại với mật khẩu mới.
            </p>
          </div>
          <div className="action-buttons">
            <Link to="/login" className="back-to-login-btn">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <h1 className="forgot-password-title">
            Đặt lại mật khẩu mới
          </h1>
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
            <button type="submit" className="reset-btn" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
          </form>
          <div className="back-to-login">
            <button onClick={() => setStep(2)}>← Quay lại nhập OTP</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <h1 className="forgot-password-title">
            Xác minh OTP
          </h1>
          <form onSubmit={handleVerifyOtp} className="forgot-password-form">
            <div className="form-group">
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Nhập mã OTP từ email"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="reset-btn" disabled={loading}>
              {loading ? "Đang xác minh..." : "Xác minh"}
            </button>
          </form>
          <div className="back-to-login">
            <button onClick={() => setStep(1)}>← Quay lại nhập email</button>
          </div>
        </div>
      </div>
    );
  }

  // Bước 1: nhập email
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h1 className="forgot-password-title">
          Quên mật khẩu?
        </h1>
        <p className="forgot-password-description">
          Nhập email của bạn và chúng tôi sẽ gửi OTP đặt lại mật khẩu.
        </p>
        <form onSubmit={handleSendOtp} className="forgot-password-form">
          <div className="form-group">
            <input
              type="text"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu đặt lại"}
          </button>
        </form>
        <div className="back-to-login">
          <Link to="/login">← Quay lại đăng nhập</Link>
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

export default ForgotPasswordForm;