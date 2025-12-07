import React from 'react';
import './Table.css';

const Table = ({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  onRowClick,
  className = '',
  striped = true,
  hover = true,
  responsive = true
}) => {
  const tableClasses = [
    'custom-table',
    striped ? 'table-striped' : '',
    hover ? 'table-hover' : '',
    className
  ].filter(Boolean).join(' ');

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    
    const value = item[column.key];
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Có' : 'Không';
    }
    
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '-';
    }
    
    return value.toString();
  };

  const handleRowClick = (item, index) => {
    if (onRowClick) {
      onRowClick(item, index);
    }
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  const tableContent = (
    <table className={tableClasses}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th 
              key={column.key || index}
              className={column.className || ''}
              style={column.width ? { width: column.width } : {}}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="table-empty">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr 
              key={item._id || item.id || index}
              onClick={() => handleRowClick(item, index)}
              className={onRowClick ? 'table-row-clickable' : ''}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={column.key || colIndex}
                  className={column.className || ''}
                >
                  {renderCell(item, column)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return responsive ? (
    <div className="table-responsive">
      {tableContent}
    </div>
  ) : (
    tableContent
  );
};

export default Table;