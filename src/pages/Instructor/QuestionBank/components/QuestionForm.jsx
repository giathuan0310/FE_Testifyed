import React from 'react';

const QuestionForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  subjects,
  isLoading,
  isEditing,
  handleAddOption,
  handleRemoveOption,
  handleUpdateOption
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Thêm handler cho acceptableAnswers
  const handleAddAcceptableAnswer = () => {
    const newAcceptableAnswers = [...(formData.acceptableAnswers || []), ''];
    setFormData({...formData, acceptableAnswers: newAcceptableAnswers});
  };

  const handleRemoveAcceptableAnswer = (index) => {
    const newAcceptableAnswers = formData.acceptableAnswers.filter((_, i) => i !== index);
    setFormData({...formData, acceptableAnswers: newAcceptableAnswers});
  };

  const handleUpdateAcceptableAnswer = (index, value) => {
    const newAcceptableAnswers = [...formData.acceptableAnswers];
    newAcceptableAnswers[index] = value;
    setFormData({...formData, acceptableAnswers: newAcceptableAnswers});
  };

  return (
    <form id="question-form" onSubmit={handleSubmit} className="question-form">
      <div className="form-group">
        <label>Nội dung câu hỏi *</label>
        <textarea
          className="form-input form-textarea"
          required
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Nhập nội dung câu hỏi"
          rows={3}
        />
      </div>

      {/* Thêm dropdown chọn loại câu hỏi */}
      <div className="form-group">
        <label>Loại câu hỏi *</label>
        <select
          className="form-select"
          required
          value={formData.questionType || 'multiple_choice'}
          onChange={(e) => {
            const newType = e.target.value;
            setFormData({
              ...formData, 
              questionType: newType,
              // Reset các field không cần thiết khi đổi type
              ...(newType === 'fill_in_blank' ? {
                options: [],
                textAnswer: '',
                acceptableAnswers: [],
                caseSensitive: false
              } : {
                textAnswer: '',
                acceptableAnswers: [],
                caseSensitive: false,
                options: formData.options?.length > 0 ? formData.options : [
                  { text: '', isCorrect: false },
                  { text: '', isCorrect: false }
                ]
              })
            });
          }}
        >
          <option value="multiple_choice">Trắc nghiệm (Multiple Choice)</option>
          <option value="fill_in_blank">Điền từ vào chỗ trống (Fill in Blank)</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Môn học *</label>
          <select
            className="form-select"
            required
            value={formData.subjectId}
            onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
          >
            <option value="">Chọn môn học</option>
            {subjects?.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Mức độ *</label>
          <select
            className="form-select"
            required
            value={formData.level}
            onChange={(e) => setFormData({...formData, level: e.target.value})}
          >
            <option value="">Chọn mức độ</option>
            <option value="Nhận biết">Nhận biết</option>
            <option value="Thông hiểu">Thông hiểu</option>
            <option value="Vận dụng">Vận dụng</option>
            <option value="Vận dụng cao">Vận dụng cao</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Chương</label>
          <input
            type="text"
            className="form-input"
            value={formData.chapter || ''}
            onChange={(e) => setFormData({...formData, chapter: e.target.value})}
            placeholder="Nhập tên chương"
          />
        </div>

        <div className="form-group">
          <label>Chủ đề</label>
          <input
            type="text"
            className="form-input"
            value={formData.topic || ''}
            onChange={(e) => setFormData({...formData, topic: e.target.value})}
            placeholder="Nhập chủ đề"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Giải thích</label>
        <textarea
          className="form-input form-textarea"
          value={formData.explanation || ''}
          onChange={(e) => setFormData({...formData, explanation: e.target.value})}
          placeholder="Nhập giải thích cho đáp án"
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>Trạng thái</label>
        <select
          className="form-select"
          value={formData.status || 'active'}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {/* Hiển thị section phù hợp theo loại câu hỏi */}
      {formData.questionType === 'fill_in_blank' ? (
        <div className="fill-blank-section">
          <div className="section-header">
            <h4>Đáp án điền từ</h4>
            <span className="section-hint">Nhập đáp án chính xác và các đáp án được chấp nhận</span>
          </div>

          <div className="form-group">
            <label>Đáp án chính xác *</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.textAnswer || ''}
              onChange={(e) => setFormData({...formData, textAnswer: e.target.value})}
              placeholder="Nhập đáp án chính xác"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.caseSensitive || false}
                onChange={(e) => setFormData({...formData, caseSensitive: e.target.checked})}
              />
              {' '}Phân biệt chữ hoa/thường
            </label>
          </div>

          <div className="acceptable-answers-section">
            <div className="section-header">
              <h5>Các đáp án được chấp nhận (tùy chọn)</h5>
              <span className="section-hint">Thêm các cách viết khác nhau của đáp án</span>
            </div>
            
            {formData.acceptableAnswers?.map((answer, index) => (
              <div key={index} className="acceptable-answer-group">
                <input
                  type="text"
                  className="form-input"
                  value={answer}
                  onChange={(e) => handleUpdateAcceptableAnswer(index, e.target.value)}
                  placeholder={`Đáp án thay thế ${index + 1}`}
                />
                <button
                  type="button"
                  className="btn-remove-option"
                  onClick={() => handleRemoveAcceptableAnswer(index)}
                  title="Xóa đáp án"
                >
                  🗑️
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="btn-add-option"
              onClick={handleAddAcceptableAnswer}
            >
              ➕ Thêm đáp án thay thế
            </button>
          </div>
        </div>
      ) : (
        <div className="options-section">
          <div className="options-header">
            <h4>Các lựa chọn đáp án</h4>
            <span className="options-hint">Chọn một đáp án đúng</span>
          </div>
          {formData.options?.map((option, index) => (
            <div key={index} className={`option-input-group ${option.isCorrect ? 'correct-option' : ''}`}>
              <div className="option-label">
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              </div>
              <input
                type="text"
                className="form-input option-input"
                placeholder={`Nhập nội dung lựa chọn ${String.fromCharCode(65 + index)}`}
                value={option.text}
                onChange={(e) => setFormData({
                  ...formData,
                  options: handleUpdateOption(formData.options, index, 'text', e.target.value)
                })}
              />
              <div className="correct-option-wrapper">
                <label className="correct-label">
                  <input
                    type="radio"
                    name="correctOption"
                    className="correct-radio"
                    checked={option.isCorrect}
                    onChange={() => {
                      const newOptions = formData.options.map((opt, i) => ({
                        ...opt,
                        isCorrect: i === index
                      }));
                      setFormData({
                        ...formData,
                        options: newOptions
                      });
                    }}
                  />
                  <span className="correct-text">
                    {option.isCorrect ? '✓ Đáp án đúng' : 'Chọn làm đáp án đúng'}
                  </span>
                </label>
              </div>
              <button
                type="button"
                className="btn-remove-option"
                onClick={() => setFormData({
                  ...formData,
                  options: handleRemoveOption(formData.options, index)
                })}
                disabled={formData.options.length <= 2}
                title="Xóa lựa chọn"
              >
                <span>🗑️</span>
              </button>
            </div>
          ))}
          
          <div className="add-option-wrapper">
            <button
              type="button"
              className="btn-add-option"
              onClick={() => setFormData({
                ...formData,
                options: handleAddOption(formData.options)
              })}
              disabled={formData.options?.length >= 6}
            >
              <span>➕</span> Thêm lựa chọn mới
            </button>
            <span className="max-options-hint">
              Tối đa {formData.options?.length || 0}/6 lựa chọn
            </span>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm câu hỏi')}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;