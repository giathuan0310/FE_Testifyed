import React, { useState, useEffect } from 'react';
import './ProfilePage.css'; // Import the CSS file
import { useAppStore } from '../../../store/appStore';
import { updateProfileApi, updatePasswordApi } from '../../../service/api/apiUser';
import { toast } from "react-toastify";
const ProfilePage = () => {
    const user = useAppStore(state => state.user);
    const setUser = useAppStore(state => state.setUser);
    const [email, setEmail] = useState(user?.email || '');
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [code, setCode] = useState(user?.code || '');
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
    const [avatarFile, setAvatarFile] = useState(null);

    //đổi mật khẩu
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChanging, setIsChanging] = useState(false);

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Vui lòng nhập đủ thông tin!");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu nhập lại không khớp!");
            return;
        }
        setIsChanging(true);
        try {
            const res = await updatePasswordApi(user.code, newPassword);
            toast.success("Đổi mật khẩu thành công!");
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
        } finally {
            setIsChanging(false);
        }
    };

    // useEffect(() => {
    //     setEmail(user?.email || '');
    //     setFullName(user?.fullName || '');
    //     setCode(user?.code || '');
    //     setAvatarPreview(user?.avatar || '');
    // }, [user]);

    const handleAvatarUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAvatarFile(file); // Lưu file để gửi lên API
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    // Gọi API cập nhật profile ở đây (giả sử có updateProfileApi)
    const handleUpdateProfile = async () => {
        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("email", email);
        if (avatarFile) {
            formData.append("avatar", avatarFile); // avatarFile là file từ input
        }
        try {
            const res = await updateProfileApi(user.code, formData);
            toast.success("Cập nhật thành công!");
            if (res.data) setUser(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Cập nhật thất bại!");
        }
    };




    return (
        <div className="profile-container"> {/* Use className */}
            <h1 className="profile-title">Thông tin cá nhân</h1> {/* Use className */}

            <div className="profile-avatar-section"> {/* Use className */}
                <div className="profile-avatar-circle"> {/* Use className */}
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="profile-avatar-image" />
                    ) : (
                        <span>{user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}</span>
                    )}
                </div>
                <label htmlFor="avatarUpload" className="profile-upload-button"> {/* Use className */}
                    Tải ảnh lên
                </label>
                <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="profile-file-input"
                />
            </div>

            {/* Email */}
            <div className="profile-form-row"> {/* Use className */}
                <div className="profile-input-group"> {/* Use className */}
                    <label htmlFor="email" className="profile-label">Email</label> {/* Use className */}
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="profile-input-field" /* Use className */
                        placeholder="Nhập email"
                    />
                </div>

                <div className="profile-input-group">
                    <label htmlFor="gender" className="profile-label">Giới tính</label>
                    <input
                        id="gender"
                        type="text"
                        value={user?.gender || ''}
                        disabled // Không cho sửa
                        className="profile-input-field"
                        placeholder="Giới tính"
                    />
                </div>

            </div>

            {/* Name and Code */}
            <div className="profile-form-row"> {/* Use className */}
                <div className="profile-input-group"> {/* Use className */}
                    <label htmlFor="fullName" className="profile-label">Họ tên</label> {/* Use className */}
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="profile-input-field" /* Use className */
                        placeholder="Nhập họ tên"
                    />
                </div>
                <div className="profile-input-group"> {/* Use className */}
                    <label htmlFor="code" className="profile-label">Mã số sinh viên</label> {/* Use className */}
                    <input
                        disabled
                        id="code"
                        type="text"
                        value={code}
                        className="profile-input-field" /* Use className */
                        placeholder="Nhập mã số sinh viên"
                    />
                </div>

            </div>

            <button onClick={handleUpdateProfile} className="profile-update-button"> {/* Use className */}
                Cập nhật
            </button>

            <div className="profile-change-password-link"> {/* Use className */}
                <button
                    type="button"
                    className="profile-change-password-btn"
                    onClick={() => setShowPasswordModal(true)}
                >
                    Đổi mật khẩu?
                </button>
            </div>
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Đổi mật khẩu</h2>
                        <div className="modal-input-group">
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                            />
                        </div>
                        <div className="modal-input-group">
                            <label>Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-primary"
                                onClick={handleChangePassword}
                                disabled={isChanging}
                            >
                                {isChanging ? "Đang đổi..." : "Đổi mật khẩu"}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowPasswordModal(false)}
                                disabled={isChanging}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
