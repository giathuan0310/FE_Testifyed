import './Footer.css';
import logoIUH from '../../../assets/Logo2T.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <img src={logoIUH} alt="IUH Logo" />
            <div>
              <h3>HỆ THỐNG KIỂM TRA TRỰC TUYẾN TESTIFYED</h3>
              <p>ONLINE TESTING</p>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>Thông tin liên hệ</h4>
          <div className="contact-item">
            <span>📍</span>
            <p>12 Nguyễn Văn Bảo, P.4, Q.Gò Vấp, TP.HCM</p>
          </div>
          <div className="contact-item">
            <span>📞</span>
            <p>0283.8940 390 - ext 838</p>
          </div>
          <div className="contact-item">
            <span>📧</span>
            <p>csm@iuh.edu.vn</p>
          </div>
        </div>

        <div className="footer-section">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Các khóa học</a></li>
            <li><a href="#">Tin tức</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Hướng dẫn sử dụng</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
            <li><a href="#">Báo lỗi</a></li>
            <li><a href="#">Góp ý</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 HỆ THỐNG KIỂM TRA TRỰC TUYẾN TESTIFYED. Tất cả quyền được bảo lưu.</p>
        <div className="social-links">
          <a href="#" title="Facebook">📘</a>
          <a href="#" title="YouTube">📺</a>
          <a href="#" title="LinkedIn">💼</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
