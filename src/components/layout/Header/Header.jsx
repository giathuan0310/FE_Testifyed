import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import logoIUH from '../../../assets/Logo2T.png';
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import { logoutApi } from '../../../service/api/apiUser';

const menuOptions = [
  { label: "Hồ sơ", link: "/student/dashboard/profile" },
  { label: "Điểm", link: "/student/dashboard/score" },
  { label: "Lịch", link: "/student/dashboard" },
  { label: "Thoát", link: "/" }
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const user = useAppStore(state => state.user);
  const clearUser = useAppStore(state => state.clearUser);
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    return name.trim().split(" ").map(word => word[0]).join("").toUpperCase();
  };

  const handleLogout = async () => {
    await logoutApi();
    localStorage.removeItem("accessToken");
    clearUser();
    navigate("/login");
  };

  return (
    <header className="header-top sticky-header">
      <div className="container">
        <div className="contact-info">
          <span className="phone">📞 Call us : 0283.8940 390 - ext 838</span>
          <span className="email">📧 E-mail : csm@iuh.edu.vn</span>
        </div>
        {!user && (
          <div className="logo-section-compact">
            <Link to="/">
              <img src={logoIUH} alt="IUH Logo" className="logo-small" />
            </Link>
            <div className="university-name-compact">
              {/* <span>TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM</span> */}
              <span>HỆ THỐNG KIỂM TRA TRỰC TUYẾN TESTIFYED</span>
            </div>
          </div>
        )}

        <div className="language-login">
          {!user && (
            <div className="language-selector-wrapper">
              <select className="language-select">
                <option value="vi">🇻🇳 Vietnamese (vi)</option>
                <option value="en">🇺🇸 English (en)</option>
              </select>
            </div>
          )}

          {user ? (
            <div className="user-menu-container" ref={menuRef}>
              <div
                className="avatar-dropdown"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="user-info-wrapper">
                  {/* <span className="avatar-circle"> */}
                  {/* {getInitials(user.fullName)} */}
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" style={{ height: 40, width: 40, borderRadius: 50, border: '2px solid #fff' }} />
                  ) : (
                    <span className="avatar-circle">
                      {getInitials(user.fullName)}
                    </span>
                  )}

                  {/* </span> */}
                  <div className="user-name-and-arrow">
                    <span className="user-name">{user.fullName}</span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </div>
              </div>
              {menuOpen && (
                <div className="dropdown-menu">
                  {menuOptions.map((option) =>
                    option.label === "Thoát" ? (
                      <span
                        key={option.label}
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {option.label}
                      </span>
                    ) : (
                      <Link
                        key={option.label}
                        to={option.link}
                        onClick={() => setMenuOpen(false)}
                      >
                        {option.label}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="loginn-btn">Đăng nhập</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;