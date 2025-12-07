import React, { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui";
import { 
  createUserApi, 
  updateUserApi, 
  updateUserPasswordApi 
} from "../../../../service/api/apiAdmin";
import { toast } from "react-toastify";

const UserModal = ({ 
  type, 
  user, 
  previewData = [], 
  selectedPreviewItems = new Set(), 
  onSelectPreviewItem,
  onSelectAllPreview,
  onRemovePreviewItem,
  onConfirmImport,
  importResult,
  loading = false,
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "STUDENT",
    gender: "Nam",
    password: "",
    confirmPassword: ""
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (type === "edit" && user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        role: user.role || "STUDENT",
        gender: user.gender || "Nam",
        password: "",
        confirmPassword: ""
      });
    } else if (type === "create") {
      setFormData({
        fullName: "",
        email: "",
        role: "STUDENT",
        gender: "Nam",
        password: "",
        confirmPassword: ""
      });
    }
    
    // Reset password fields khi modal được mở
    setNewPassword("");
    setConfirmPassword("");
  }, [type, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ");
      return false;
    }
    if (type === "create") {
      if (!formData.password) {
        toast.error("Vui lòng nhập mật khẩu");
        return false;
      }
      if (formData.password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setModalLoading(true);
    try {
      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        gender: formData.gender
      };
      
      if (type === "create") {
        submitData.password = formData.password;
      }

      let response;
      if (type === "create") {
        response = await createUserApi(submitData);
      } else if (type === "edit") {
        response = await updateUserApi(user.code, submitData);
      }

      if (response.status) {
        toast.success(type === "create" ? "Tạo người dùng thành công" : "Cập nhật người dùng thành công");
        onSuccess();
      } else {
        toast.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Có lỗi xảy ra khi xử lý yêu cầu");
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setModalLoading(true);
    try {
      const response = await updateUserPasswordApi(user.code, newPassword);
      if (response.status) {
        toast.success("Đổi mật khẩu thành công");
        onSuccess();
      } else {
        toast.error("Không thể đổi mật khẩu");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Lỗi khi đổi mật khẩu");
    } finally {
      setModalLoading(false);
    }
  };

  const getRoleName = (role) => {
    const roleMap = {
      ADMIN: "Quản trị viên",
      INSTRUCTOR: "Giảng viên",
      STUDENT: "Sinh viên",
    };
    return roleMap[role] || role;
  };

  const getModalContent = () => {
    switch (type) {
      case "view":
        return (
          <div className="user-details">
            <div className="user-avatar-large">
              <img src={user.avatar || "/default-avatar.png"} alt="Avatar" />
            </div>
            <div className="user-info">
              <div className="info-item">
                <label>Mã số:</label>
                <span>{user.code}</span>
              </div>
              <div className="info-item">
                <label>Họ và tên:</label>
                <span>{user.fullName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Vai trò:</label>
                <span>{getRoleName(user.role)}</span>
              </div>
              <div className="info-item">
                <label>Giới tính:</label>
                <span>{user.gender}</span>
              </div>
              <div className="info-item">
                <label>Trạng thái:</label>
                <span
                  className={`status-badge ${
                    user.isActive ? "active" : "inactive"
                  }`}
                >
                  {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                </span>
              </div>
              <div className="info-item">
                <label>Ngày tạo:</label>
                <span>
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        );

      case "create":
      case "edit":
        return (
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vai trò *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="STUDENT">Sinh viên</option>
                  <option value="INSTRUCTOR">Giảng viên</option>
                </select>
              </div>
              <div className="form-group">
                <label>Giới tính *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            {type === "create" && (
              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    minLength={6}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                </div>
              </div>
            )}
          </form>
        );

      case "changePassword":
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="password-form">
            <p>
              Đổi mật khẩu cho người dùng: <strong>{user.fullName}</strong>
            </p>
            <div className="form-group">
              <label>Mật khẩu mới:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </form>
        );

      case "importResult":
        return (
          <div className="import-result">
            <div className="import-summary">
              <h4>Kết quả Import</h4>
              <div className="summary-stats">
                <div className="stat-item success">
                  <span className="stat-number">{importResult?.summary.success || 0}</span>
                  <span className="stat-label">Thành công</span>
                </div>
                <div className="stat-item warning">
                  <span className="stat-number">{importResult?.summary.duplicates || 0}</span>
                  <span className="stat-label">Trùng lặp</span>
                </div>
                <div className="stat-item error">
                  <span className="stat-number">{importResult?.summary.errors || 0}</span>
                  <span className="stat-label">Lỗi</span>
                </div>
                <div className="stat-item total">
                  <span className="stat-number">{importResult?.summary.total || 0}</span>
                  <span className="stat-label">Tổng cộng</span>
                </div>
              </div>
            </div>

            {/* Chi tiết trùng lặp */}
            {importResult?.details.duplicates.length > 0 && (
              <div className="import-details">
                <h5>Chi tiết trùng lặp ({importResult.details.duplicates.length})</h5>
                <div className="details-list">
                  {importResult.details.duplicates.slice(0, 10).map((item, index) => (
                    <div key={index} className="detail-item duplicate">
                      <strong>Dòng {item.row}:</strong> {item.data.fullName} ({item.data.email})
                      <br />
                      <small>Lý do: {item.reason}</small>
                    </div>
                  ))}
                  {importResult.details.duplicates.length > 10 && (
                    <div className="more-items">
                      ... và {importResult.details.duplicates.length - 10} trường hợp khác
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chi tiết lỗi */}
            {importResult?.details.errors.length > 0 && (
              <div className="import-details">
                <h5>Chi tiết lỗi ({importResult.details.errors.length})</h5>
                <div className="details-list">
                  {importResult.details.errors.slice(0, 10).map((item, index) => (
                    <div key={index} className="detail-item error">
                      <strong>Dòng {item.row}:</strong> {item.data.fullName || 'N/A'} ({item.data.email || 'N/A'})
                      <br />
                      <small>Lỗi: {item.error}</small>
                    </div>
                  ))}
                  {importResult.details.errors.length > 10 && (
                    <div className="more-items">
                      ... và {importResult.details.errors.length - 10} lỗi khác
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chi tiết thành công */}
            {importResult?.details.success.length > 0 && (
              <div className="import-details">
                <h5>Người dùng đã thêm thành công ({importResult.details.success.length})</h5>
                <div className="details-list">
                  {importResult.details.success.slice(0, 5).map((item, index) => (
                    <div key={index} className="detail-item success">
                      <strong>{item.user.fullName}</strong> - {item.user.email} - {item.user.code}
                    </div>
                  ))}
                  {importResult.details.success.length > 5 && (
                    <div className="more-items">
                      ... và {importResult.details.success.length - 5} người dùng khác
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "importPreview":
        return (
          <div className="import-preview">
            <div className="preview-header">
              <div className="preview-stats">
                <span className="stat-item">
                  <strong>Tổng: {previewData.length}</strong>
                </span>
                <span className="stat-item success">
                  <strong>Hợp lệ: {previewData.filter(item => item.isValid).length}</strong>
                </span>
                <span className="stat-item error">
                  <strong>Lỗi: {previewData.filter(item => !item.isValid).length}</strong>
                </span>
                <span className="stat-item">
                  <strong>Đã chọn: {selectedPreviewItems.size}</strong>
                </span>
              </div>
              <div className="preview-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={onSelectAllPreview}
                >
                  {selectedPreviewItems.size === previewData.filter(item => item.isValid).length 
                    ? "Bỏ chọn tất cả" 
                    : "Chọn tất cả hợp lệ"}
                </button>
              </div>
            </div>

            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th style={{width: "50px"}}>
                      <input
                        type="checkbox"
                        checked={selectedPreviewItems.size === previewData.filter(item => item.isValid).length && previewData.filter(item => item.isValid).length > 0}
                        onChange={onSelectAllPreview}
                      />
                    </th>
                    <th>STT</th>
                    <th>Mã số</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Giới tính</th>
                    <th>Trạng thái</th>
                    <th>Lỗi</th>
                    <th style={{width: "80px"}}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`preview-row ${!item.isValid ? 'invalid' : ''} ${selectedPreviewItems.has(index) ? 'selected' : ''}`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPreviewItems.has(index)}
                          onChange={() => onSelectPreviewItem(index)}
                          disabled={!item.isValid}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{item.code || 'Auto'}</td>
                      <td>{item.fullName}</td>
                      <td>{item.email}</td>
                      <td>{item.role === 'STUDENT' ? 'Sinh viên' : item.role === 'INSTRUCTOR' ? 'Giảng viên' : item.role}</td>
                      <td>{item.gender}</td>
                      <td>
                        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                          {item.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                      </td>
                      <td>
                        {!item.isValid && (
                          <span className="error-text" title={item.errors?.join(', ')}>
                            {item.errors?.length > 0 ? item.errors[0] : 'Có lỗi'}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onRemovePreviewItem(index)}
                          title="Xóa khỏi danh sách"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.length === 0 && (
              <div className="empty-preview">
                <p>Không có dữ liệu để hiển thị</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case "view":
        return "Chi tiết người dùng";
      case "create":
        return "Thêm người dùng mới";
      case "edit":
        return "Chỉnh sửa người dùng";
      case "changePassword":
        return "Đổi mật khẩu";
      case "importResult":
        return "Kết quả Import Excel";
      case "importPreview":
        return "Xem trước dữ liệu Import";
      default:
        return "";
    }
  };

  const getModalActions = () => {
    switch (type) {
      case "view":
        return (
          <button key="close" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        );

      case "importResult":
        return (
          <button key="close" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        );

      case "importPreview":
        return (
          <>
            <button key="cancel" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button
              key="import"
              className="btn btn-primary"
              onClick={onConfirmImport}
              disabled={loading || selectedPreviewItems.size === 0}
            >
              {loading ? "Đang import..." : `Import (${selectedPreviewItems.size})`}
            </button>
          </>
        );

      case "create":
      case "edit":
        return (
          <>
            <button key="cancel" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button
              key="save"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={modalLoading}
            >
              {modalLoading ? "Đang xử lý..." : "Lưu"}
            </button>
          </>
        );

      case "changePassword":
        return (
          <>
            <button key="cancel" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button
              key="save"
              className="btn btn-primary"
              onClick={handleChangePassword}
              disabled={modalLoading}
            >
              {modalLoading ? "Đang xử lý..." : "Lưu"}
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      isOpen={true}
      onClose={onClose}
      footer={getModalActions()}
    >
      {getModalContent()}
    </Modal>
  );
};

export default UserModal;