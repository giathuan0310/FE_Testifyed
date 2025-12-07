import React, { useState } from 'react';
import { FiDownload, FiUpload, FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { Modal } from '../../../../components/ui';
import { 
  exportQuestionsApi, 
  previewExcelQuestionsApi, 
  importFilteredQuestionsApi 
} from '../../../../service/api/apiQuestion';
import { toast } from 'react-toastify';
import './ImportExportModal.css';

const ImportExportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState('import'); // 'import' or 'export'
  const [previewData, setPreviewData] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await exportQuestionsApi();
      
      // Check if response has data
      if (!response || !response.data) {
        toast.error('Không nhận được dữ liệu từ server');
        return;
      }

      // Check if it's an error response (JSON instead of blob)
      if (response.data.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            toast.error('Lỗi: ' + (errorData.error || errorData.message || 'Unknown error'));
          } catch (e) {
            toast.error('Lỗi khi xuất file Excel');
          }
        };
        reader.readAsText(response.data);
        return;
      }
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response header or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Danh_sach_cau_hoi_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
          fileName = decodeURIComponent(fileName);
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Export error:', error);
      
      // Try to extract error message from response
      let errorMessage = 'Lỗi khi xuất file Excel';
      if (error.response) {
        if (error.response.data) {
          // If it's a blob, try to read it as JSON
          if (error.response.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorData = JSON.parse(reader.result);
                toast.error('Lỗi: ' + (errorData.error || errorData.message || errorMessage));
              } catch (e) {
                toast.error(errorMessage + ': ' + error.message);
              }
            };
            reader.readAsText(error.response.data);
            return;
          } else if (typeof error.response.data === 'object') {
            errorMessage = error.response.data.error || error.response.data.message || errorMessage;
          }
        }
        errorMessage += ` (Status: ${error.response.status})`;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      event.target.value = '';
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB');
      event.target.value = '';
      return;
    }

    try {
      setLoading(true);
      const response = await previewExcelQuestionsApi(file);

      if (response && response.success) {
        setPreviewData(response.data);
        
        // Select all valid items by default
        const validIndexes = new Set(
          response.data
            .map((item, index) => item.isValid ? index : null)
            .filter(index => index !== null)
        );
        setSelectedItems(validIndexes);
        setShowPreview(true);
        
        toast.success(`Đã đọc được ${response.data.length} câu hỏi từ file Excel`);
      } else {
        toast.error(response?.message || 'Lỗi khi đọc file Excel');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Lỗi khi đọc file Excel: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSelectItem = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    const validIndexes = previewData
      .map((item, index) => item.isValid ? index : null)
      .filter(index => index !== null);

    if (selectedItems.size === validIndexes.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(validIndexes));
    }
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);

      // Get selected data
      const selectedData = Array.from(selectedItems)
        .map(index => previewData[index])
        .filter(item => item.isValid);

      if (selectedData.length === 0) {
        toast.warning('Vui lòng chọn ít nhất một câu hỏi để import');
        return;
      }

      const response = await importFilteredQuestionsApi(selectedData);

      if (response && response.success) {
        const result = response.data;
        toast.success(
          `Import thành công ${result.success?.length || 0} câu hỏi! ` +
          (result.duplicates?.length ? `${result.duplicates.length} trùng lặp. ` : '') +
          (result.errors?.length ? `${result.errors.length} lỗi.` : '')
        );

        // Reset and close
        setShowPreview(false);
        setPreviewData([]);
        setSelectedItems(new Set());
        
        // Notify parent to refresh
        if (onImportSuccess) {
          onImportSuccess();
        }
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        toast.error(response?.message || 'Lỗi khi import câu hỏi');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Lỗi khi import câu hỏi: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewData([]);
    setSelectedItems(new Set());
  };

  const renderPreviewTable = () => {
    const validCount = previewData.filter(item => item.isValid).length;
    const invalidCount = previewData.length - validCount;

    return (
      <div className="import-preview-container">
        <div className="preview-header">
          <h3>Xem trước dữ liệu ({previewData.length} câu hỏi)</h3>
          <div className="preview-stats">
            <span className="stat-valid">
              <FiCheckCircle /> {validCount} hợp lệ
            </span>
            {invalidCount > 0 && (
              <span className="stat-invalid">
                <FiXCircle /> {invalidCount} không hợp lệ
              </span>
            )}
          </div>
        </div>

        <div className="preview-actions">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={selectedItems.size === validCount && validCount > 0}
              onChange={handleSelectAll}
            />
            <span>Chọn tất cả ({selectedItems.size} đã chọn)</span>
          </label>
        </div>

        <div className="preview-table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Chọn</th>
                <th style={{ width: '60px' }}>STT</th>
                <th style={{ width: '50px' }}>Trạng thái</th>
                <th>Nội dung</th>
                <th style={{ width: '120px' }}>Loại</th>
                <th style={{ width: '150px' }}>Môn học ID</th>
                <th style={{ width: '100px' }}>Level</th>
                <th style={{ width: '200px' }}>Lỗi</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((item, index) => (
                <tr key={index} className={!item.isValid ? 'invalid-row' : ''}>
                  <td>
                    {item.isValid && (
                      <input
                        type="checkbox"
                        checked={selectedItems.has(index)}
                        onChange={() => handleSelectItem(index)}
                      />
                    )}
                  </td>
                  <td>{item.rowNumber || index + 1}</td>
                  <td>
                    {item.isValid ? (
                      <FiCheckCircle className="icon-valid" />
                    ) : (
                      <FiXCircle className="icon-invalid" />
                    )}
                  </td>
                  <td>
                    <div className="content-cell" title={item.content}>
                      {item.content || '-'}
                    </div>
                  </td>
                  <td>{item.questionType || 'multiple_choice'}</td>
                  <td>{item.subjectId || '-'}</td>
                  <td>{item.level || '-'}</td>
                  <td>
                    {!item.isValid && item.errors && item.errors.length > 0 && (
                      <div className="error-messages">
                        {item.errors.map((err, i) => (
                          <div key={i} className="error-item">
                            <FiAlertCircle /> {err}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="preview-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleCancelPreview}
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirmImport}
            disabled={loading || selectedItems.size === 0}
          >
            {loading ? 'Đang import...' : `Import ${selectedItems.size} câu hỏi`}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import/Export câu hỏi"
      size="xlarge"
    >
      <div className="import-export-modal">
        {!showPreview ? (
          <>
            <div className="modal-tabs">
              <button
                className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
                onClick={() => setActiveTab('import')}
              >
                <FiUpload /> Import
              </button>
              <button
                className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                <FiDownload /> Export
              </button>
            </div>

            <div className="modal-content">
              {activeTab === 'import' ? (
                <div className="import-section">
                  <div className="info-box">
                    <h3>Hướng dẫn Import</h3>
                    <ul>
                      <li>File Excel phải có các cột: <strong>Nội dung</strong>, <strong>SubjectId</strong></li>
                      <li>Cột tùy chọn: Loại câu hỏi, Options, Chapter, Topic, Level, Explanation</li>
                      <li>Options format: <code>text||true;;text2||false</code> (phân tách bởi ;;)</li>
                      <li>Loại câu hỏi: <code>multiple_choice</code> hoặc <code>fill_in_blank</code></li>
                      <li>File không được quá 10MB</li>
                    </ul>
                  </div>

                  <div className="upload-area">
                    <input
                      type="file"
                      id="question-upload"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="question-upload" className="upload-label">
                      <FiUpload size={48} />
                      <h3>Chọn file Excel</h3>
                      <p>Kéo thả hoặc click để chọn file (.xlsx, .xls)</p>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="export-section">
                  <div className="info-box">
                    <h3>Export danh sách câu hỏi</h3>
                    <p>Xuất tất cả câu hỏi do bạn tạo ra file Excel</p>
                    <ul>
                      <li>File sẽ chứa đầy đủ thông tin câu hỏi</li>
                      <li>Có thể dùng để backup hoặc chỉnh sửa hàng loạt</li>
                      <li>Format giống với file import</li>
                    </ul>
                  </div>

                  <div className="export-actions">
                    <button
                      className="btn btn-primary btn-large"
                      onClick={handleExport}
                      disabled={loading}
                    >
                      <FiDownload size={20} />
                      {loading ? 'Đang xuất...' : 'Xuất file Excel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          renderPreviewTable()
        )}
      </div>
    </Modal>
  );
};

export default ImportExportModal;
