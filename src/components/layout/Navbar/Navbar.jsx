import React from 'react';
import './Navbar.css';
import logoIUH from '../../../assets/Logo2T.png';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ location }) => {
    const isActive = (path) => {
        // Nếu path là rỗng, nó sẽ khớp với route cha '/student/dashboard'
        if (path === '') {
            return location.pathname === '/student/dashboard';
        }
        // Nếu path là 'trang-chu', nó sẽ khớp với '/student/dashboard/trang-chu'
        return location.pathname === `/student/dashboard/${path}`;
    };
    return (
        <nav className="dashboard-navbar">
            <div className="navbar-container">
                {/* Phần Logo */}
                <div className="navbar-logo-section">
                    <img src={logoIUH} alt="IUH Logo" className="navbar-logo-small" />
                </div>

                {/* Phần Menu */}
                <div className="navbar-menu">
                    <ul>
                        <li>
                            {/* Link "Trang chủ" trong Navbar sẽ điều hướng đến /student/dashboard/trang-chu */}
                            <Link to="/student/dashboard/trang-chu" className={isActive('trang-chu') ? 'active' : ''}>
                                Trang Chủ
                            </Link>
                        </li>
                        <li>
                            {/* Link "Bảng Điều khiển" sẽ dẫn về /student/dashboard (route mặc định của Dashboard) */}
                            <Link to="/student/dashboard" className={isActive('') ? 'active' : ''}>
                                Bảng Điều Khiển
                            </Link>
                        </li>
                        <li>
                            {/* Link "Các khoá học của tôi" sẽ dẫn đến /student/dashboard/my-courses */}
                            <Link to="/student/dashboard/my-courses" className={isActive('my-courses') ? 'active' : ''}>
                                Các Lớp Học Của Tôi
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
