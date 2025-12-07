import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  UserX,
  Lock,
  Unlock,
  Key,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import { Table } from "../../../components/ui";
import {
  getAllUsersApi,
  disableUserApi,
  enableUserApi,
  toggleUserStatusApi,
  exportUsersApi,
  previewExcelDataApi,
  importFilteredUsersApi
} from "../../../service/api/apiAdmin";
import { toast } from "react-toastify";
import UserModal from "./components/UserModal";
import "./ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'view', 'edit', 'changePassword', 'create', 'importResult', 'importPreview'
  const [importResult, setImportResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [selectedPreviewItems, setSelectedPreviewItems] = useState(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsersApi();
      if (response.status) {
        setUsers(response.data);
      } else {
        toast.error("Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "ALL" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });
  // Pagination state (added)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const paginationData = useMemo(() => {
    const totalItems = (filteredUsers || []).length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = (filteredUsers || []).slice(startIndex, endIndex);
    const startItem = totalItems === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, totalItems);

    return {
      totalItems,
      totalPages,
      paginatedUsers,
      startIndex,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredUsers, currentPage, itemsPerPage]);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const { totalPages } = paginationData;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }
    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
  };

  const handleToggleUserStatus = async (userCode, currentStatus) => {
    try {
      const response = await toggleUserStatusApi(userCode);
      if (response.status) {
        const message = response.data.isActive
          ? "Kích hoạt người dùng thành công"
          : "Vô hiệu hóa người dùng thành công";
        toast.success(message);
        fetchUsers();
        setShowModal(false);
      } else {
        toast.error("Không thể thay đổi trạng thái người dùng");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Lỗi khi thay đổi trạng thái người dùng");
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await exportUsersApi();

      // Tạo URL để download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Lấy tên file từ header hoặc tạo tên mặc định
      const fileName = `Danh_sach_nguoi_dung_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', fileName);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Cleanup URL
      window.URL.revokeObjectURL(url);

      toast.success("Xuất Excel thành công!");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Lỗi khi xuất file Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng file
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      event.target.value = '';
      return;
    }

    // Kiểm tra kích thước file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn! Vui lòng chọn file nhỏ hơn 5MB");
      event.target.value = '';
      return;
    }

    try {
      setLoading(true);
      const response = await previewExcelDataApi(file);

      if (response && response.status) {
        // Hiển thị preview data
        setPreviewData(response.data);
        // Select all valid items by default
        const validIndexes = new Set(
          response.data
            .map((item, index) => item.isValid ? index : null)
            .filter(index => index !== null)
        );
        setSelectedPreviewItems(validIndexes);
        setModalType("importPreview");
        setShowModal(true);

        toast.success(`Đã đọc được ${response.data.length} dòng dữ liệu từ file Excel`);
      } else {
        toast.error(response?.message || "Lỗi khi đọc file Excel");
      }
    } catch (error) {
      console.error("Error previewing Excel:", error);
      // Xử lý lỗi response từ API
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Có lỗi xảy ra khi đọc file Excel");
      } else {
        toast.error("Lỗi khi đọc file Excel: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
      if (event.target) {
        event.target.value = ''; // Reset input
      }
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalType("");
    setPreviewData([]);
    setSelectedPreviewItems(new Set());
  };

  // Handle preview modal functions
  const handleSelectPreviewItem = (index) => {
    const newSelected = new Set(selectedPreviewItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPreviewItems(newSelected);
  };

  const handleSelectAllPreview = () => {
    const validIndexes = previewData
      .map((item, index) => item.isValid ? index : null)
      .filter(index => index !== null);

    if (selectedPreviewItems.size === validIndexes.length) {
      // Deselect all
      setSelectedPreviewItems(new Set());
    } else {
      // Select all valid items
      setSelectedPreviewItems(new Set(validIndexes));
    }
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);

      // Get selected data
      const selectedData = Array.from(selectedPreviewItems)
        .map(index => previewData[index])
        .filter(item => item.isValid);

      if (selectedData.length === 0) {
        toast.warning("Vui lòng chọn ít nhất một người dùng để import");
        return;
      }

      const response = await importFilteredUsersApi({ users: selectedData });

      if (response && response.status) {
        // Hiển thị kết quả import
        setImportResult(response.data);
        setModalType("importResult");

        // Refresh danh sách users
        await fetchUsers();

        toast.success(`Import hoàn tất! Thành công: ${response.data.summary.success}, Trùng lặp: ${response.data.summary.duplicates}, Lỗi: ${response.data.summary.errors}`);
      } else {
        toast.error(response?.message || "Lỗi khi import dữ liệu");
      }
    } catch (error) {
      console.error("Error importing filtered data:", error);
      toast.error("Có lỗi xảy ra khi import dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const removePreviewItem = (index) => {
    const newPreviewData = previewData.filter((_, i) => i !== index);
    const newSelectedItems = new Set();

    // Adjust selected indexes
    selectedPreviewItems.forEach(selectedIndex => {
      if (selectedIndex < index) {
        newSelectedItems.add(selectedIndex);
      } else if (selectedIndex > index) {
        newSelectedItems.add(selectedIndex - 1);
      }
    });

    setPreviewData(newPreviewData);
    setSelectedPreviewItems(newSelectedItems);
  };

  const getRoleName = (role) => {
    const roleMap = {
      ADMIN: "Quản trị viên",
      INSTRUCTOR: "Giảng viên",
      STUDENT: "Sinh viên",
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
        {isActive ? "Hoạt động" : "Vô hiệu hóa"}
      </span>
    );
  };

  const columns = [
    {
      key: 'stt',
      title: 'STT',

      render: (_, item) => (
        <div className="col-stt">
          {item.__stt}
        </div>
      )
    },
    {
      key: "code",
      title: "Mã số",
      width: "100px",
    },
    {
      key: "avatar",
      title: "Avatar",
      width: "80px",
      render: (value, user) => (
        <img
          src={value || "/default-avatar.jpg"}
          alt="Avatar"
          className="user-avatar"
        />
      ),
    },
    {
      key: "fullName",
      title: "Họ và tên",
      width: "200px",
    },
    {
      key: "email",
      title: "Email",
      width: "250px",
    },
    {
      key: "role",
      title: "Vai trò",
      width: "120px",
      render: (value) => getRoleName(value),
    },
    {
      key: "gender",
      title: "Giới tính",
      width: "100px",
    },
    {
      key: "isActive",
      title: "Trạng thái",
      width: "120px",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "200px",
      render: (_, user) => (
        <div className="action-buttons">
          <button
            className="action-btn view"
            onClick={() => openModal("view", user)}
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            className="action-btn edit"
            onClick={() => openModal("edit", user)}
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
          <button
            className="action-btn password"
            onClick={() => openModal("changePassword", user)}
            title="Đổi mật khẩu"
          >
            <Key size={16} />
          </button>
          <button
            className={`action-btn ${user.isActive ? "warning" : "success"}`}
            onClick={() => handleToggleUserStatus(user.code, user.isActive)}
            title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            style={{ marginTop: "0px" }}
          >
            {user.isActive ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="manage-users">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>
            <Users size={24} />
            Quản lý người dùng
          </h1>
          <p>Quản lý thông tin người dùng trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn secondary" onClick={handleExportExcel} disabled={loading}>
            <Download size={16} />
            {loading ? "Đang xuất..." : "Xuất Excel"}
          </button>
          <label className="btn secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            Nhập Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn primary" onClick={() => openModal("create")}>
            <Plus size={16} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã số, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="INSTRUCTOR">Giảng viên</option>
            <option value="STUDENT">Sinh viên</option>
          </select>
        </div>

        <div className="results-info">
          Hiển thị {filteredUsers.length} / {users.length} người dùng
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table
          columns={columns}
          data={(paginationData.paginatedUsers || []).map((c, i) => ({ ...c, __stt: paginationData.startIndex + i + 1 }))}
          loading={loading}
          emptyMessage="Không có người dùng nào"
        />
        {/* Pagination controls */}
        {paginationData.totalPages > 1 && (
          <div className="pagination-container" style={{ marginTop: 12 }}>
            <div className="pagination-info">
              <span>
                Hiển thị {paginationData.startItem} - {paginationData.endItem} trong tổng số {paginationData.totalItems} kết quả
              </span>
            </div>

            <div className="pagination-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="items-per-page">
                <label>Hiển thị:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="items-per-page-select"
                  style={{ marginLeft: 8 }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="pagination-buttons" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="pagination-btn" onClick={() => handlePageChange(1)} disabled={!paginationData.hasPrevPage} title="Trang đầu">«</button>
                <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={!paginationData.hasPrevPage} title="Trang trước">‹</button>

                <div className="page-numbers" style={{ display: 'flex', gap: 6 }}>
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`page-number ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                      onClick={() => page !== '...' && handlePageChange(page)}
                      disabled={page === '...'}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={!paginationData.hasNextPage} title="Trang sau">›</button>
                <button className="pagination-btn" onClick={() => handlePageChange(paginationData.totalPages)} disabled={!paginationData.hasNextPage} title="Trang cuối">»</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          type={modalType}
          user={selectedUser}
          previewData={previewData}
          selectedPreviewItems={selectedPreviewItems}
          onSelectPreviewItem={handleSelectPreviewItem}
          onSelectAllPreview={handleSelectAllPreview}
          onRemovePreviewItem={removePreviewItem}
          onConfirmImport={handleConfirmImport}
          importResult={importResult}
          loading={loading}
          onClose={closeModal}
          onSuccess={() => {
            fetchUsers();
            closeModal();
          }}
        />
      )}
    </div>
  );
};

export default ManageUsers;
