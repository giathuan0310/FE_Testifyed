import React, { useState, useEffect } from 'react';
import { 
  getAllClassesForAdminApi, 
  getAllSubjectsApi, 
  getAllExamsApi, 
  getAllExamSchedulesApi 
} from '../../../../service/api/apiAdmin';
import { toast } from 'react-toastify';

const ApiDataDisplay = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('classes');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Bắt đầu fetch tất cả dữ liệu...');

      // Fetch Classes
      try {
        const classesResponse = await getAllClassesForAdminApi();
        console.log('📚 Classes Response:', classesResponse);
        if (classesResponse.status) {
          setClasses(classesResponse.data || []);
          console.log('✅ Classes loaded:', classesResponse.data?.length || 0);
        }
      } catch (error) {
        console.error('❌ Error fetching classes:', error);
        toast.error('Lỗi khi tải lớp học');
      }

      // Fetch Subjects
      try {
        const subjectsResponse = await getAllSubjectsApi();
        console.log('📖 Subjects Response:', subjectsResponse);
        if (subjectsResponse.status) {
          setSubjects(subjectsResponse.data || []);
          console.log('✅ Subjects loaded:', subjectsResponse.data?.length || 0);
        }
      } catch (error) {
        console.error('❌ Error fetching subjects:', error);
        toast.error('Lỗi khi tải môn học');
      }

      // Fetch Exams
      try {
        const examsResponse = await getAllExamsApi();
        console.log('📝 Exams Response:', examsResponse);
        if (examsResponse.success || examsResponse.status) {
          setExams(examsResponse.data || []);
          console.log('✅ Exams loaded:', examsResponse.data?.length || 0);
        }
      } catch (error) {
        console.error('❌ Error fetching exams:', error);
        toast.error('Lỗi khi tải bài thi');
      }

      // Fetch Exam Schedules
      try {
        const schedulesResponse = await getAllExamSchedulesApi();
        console.log('📅 Exam Schedules Response:', schedulesResponse);
        if (schedulesResponse.status) {
          setExamSchedules(schedulesResponse.data || []);
          console.log('✅ Exam Schedules loaded:', schedulesResponse.data?.length || 0);
        }
      } catch (error) {
        console.error('❌ Error fetching exam schedules:', error);
        toast.error('Lỗi khi tải lịch thi');
      }

      console.log('🎉 Hoàn thành fetch tất cả dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, count, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label} ({count})
    </button>
  );

  const renderClasses = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lớp học ({classes.length})</h3>
      {classes.length === 0 ? (
        <p className="text-gray-500">Không có lớp học nào</p>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls, index) => (
            <div key={cls._id || index} className="border rounded-lg p-4 bg-white">
              <h4 className="font-medium text-lg">{cls.name}</h4>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Môn học:</strong> {cls.subjectId?.name || 'N/A'} ({cls.subjectId?.code || 'N/A'})</p>
                <p><strong>Giáo viên:</strong> {cls.teacherId?.fullName || 'N/A'} ({cls.teacherId?.code || 'N/A'})</p>
                <p><strong>Mã tham gia:</strong> {cls.codeJoin}</p>
                <p><strong>Số sinh viên:</strong> {cls.studentIds?.length || 0}</p>
                <p><strong>Ngày tạo:</strong> {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Môn học ({subjects.length})</h3>
      {subjects.length === 0 ? (
        <p className="text-gray-500">Không có môn học nào</p>
      ) : (
        <div className="grid gap-4">
          {subjects.map((subject, index) => (
            <div key={subject._id || index} className="border rounded-lg p-4 bg-white">
              <h4 className="font-medium text-lg">{subject.name}</h4>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Mã môn:</strong> {subject.code}</p>
                <p><strong>Mô tả:</strong> {subject.description || 'Không có mô tả'}</p>
                <p><strong>Ngày tạo:</strong> {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExams = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bài thi ({exams.length})</h3>
      {exams.length === 0 ? (
        <p className="text-gray-500">Không có bài thi nào</p>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam, index) => (
            <div key={exam._id || index} className="border rounded-lg p-4 bg-white">
              <h4 className="font-medium text-lg">{exam.name}</h4>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Thời gian:</strong> {exam.duration} phút</p>
                <p><strong>Trạng thái:</strong> {exam.status || 'N/A'}</p>
                <p><strong>Người tạo:</strong> {exam.creatorId?.fullName || 'N/A'}</p>
                <p><strong>Ngày tạo:</strong> {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExamSchedules = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lịch thi ({examSchedules.length})</h3>
      {examSchedules.length === 0 ? (
        <p className="text-gray-500">Không có lịch thi nào</p>
      ) : (
        <div className="grid gap-4">
          {examSchedules.map((schedule, index) => (
            <div key={schedule._id || index} className="border rounded-lg p-4 bg-white">
              <h4 className="font-medium text-lg">
                {schedule.examId?.name || 'Bài thi không xác định'}
              </h4>
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Lớp học:</strong> {schedule.classId?.name || 'N/A'}</p>
                <p><strong>Ngày thi:</strong> {schedule.startTime ? new Date(schedule.startTime).toLocaleDateString('vi-VN') : 'N/A'}</p>
                <p><strong>Giờ bắt đầu:</strong> {schedule.startTime ? new Date(schedule.startTime).toLocaleTimeString('vi-VN') : 'N/A'}</p>
                <p><strong>Giờ kết thúc:</strong> {schedule.endTime ? new Date(schedule.endTime).toLocaleTimeString('vi-VN') : 'N/A'}</p>
                <p><strong>Địa điểm:</strong> {schedule.location || 'N/A'}</p>
                <p><strong>Trạng thái:</strong> {schedule.status || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'classes':
        return renderClasses();
      case 'subjects':
        return renderSubjects();
      case 'exams':
        return renderExams();
      case 'schedules':
        return renderExamSchedules();
      default:
        return renderClasses();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Test API - Hiển thị dữ liệu</h2>
        
        {/* Loading indicator */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">🔄 Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : '🔄 Tải lại dữ liệu'}
        </button>

        {/* Tab buttons */}
        <div className="flex space-x-2 mb-6">
          <TabButton
            id="classes"
            label="Lớp học"
            count={classes.length}
            isActive={activeTab === 'classes'}
            onClick={setActiveTab}
          />
          <TabButton
            id="subjects"
            label="Môn học"
            count={subjects.length}
            isActive={activeTab === 'subjects'}
            onClick={setActiveTab}
          />
          <TabButton
            id="exams"
            label="Bài thi"
            count={exams.length}
            isActive={activeTab === 'exams'}
            onClick={setActiveTab}
          />
          <TabButton
            id="schedules"
            label="Lịch thi"
            count={examSchedules.length}
            isActive={activeTab === 'schedules'}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ApiDataDisplay;