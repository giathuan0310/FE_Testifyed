import React from 'react';
import './AdminTable.css';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';

const AdminTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView,
  loading = false,
  emptyMessage = "Không có dữ liệu"
}) => {
  const handleAction = (action, item) => {
    switch (action) {
      case 'edit':
        onEdit && onEdit(item);
        break;
      case 'delete':
        onDelete && onDelete(item);
        break;
      case 'view':
        onView && onView(item);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`column-${column.key}`}>
                  {column.title}
                </th>
              ))}
              <th className="actions-column">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={item._id || index} className="table-row">
                  {columns.map((column) => (
                    <td key={column.key} className={`column-${column.key}`}>
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                  <td className="actions-column">
                    <div className="action-buttons">
                      {onView && (
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleAction('view', item)}
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleAction('edit', item)}
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleAction('delete', item)}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="empty-state">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;