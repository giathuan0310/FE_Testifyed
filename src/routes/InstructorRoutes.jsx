import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InstructorLayout from '../layouts/InstructorLayout';
import {
  Dashboard,
  ClassManagement,
  QuestionBank,
  ExamManagement,
  Settings,
  SubjectManagement,
  ExamSchedules,
  ResultManagement
} from '../pages/Instructor';

const InstructorRoutes = ({ user }) => {
  return (
    <Routes>
      <Route path="/" element={<InstructorLayout user={user} />}>
        {/* Redirect từ /instructor tự động sang /instructor/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard user={user} />} />

        {/* Class Management */}
        <Route path="classes" element={<ClassManagement user={user} />} />
        <Route path="classes/new" element={<ClassManagement user={user} />} />

        {/* Subject Management */}
        <Route path="subjects" element={<SubjectManagement user={user} />} />
        {/* Exam Management */}
        <Route path="exams" element={<ExamManagement user={user} />} />
        <Route path="exams/new" element={<ExamManagement user={user} />} />

        {/* Exam Schedules */}
        <Route path="schedules" element={<ExamSchedules user={user} />} />

        {/* Result Management */}
        <Route path="results" element={<ResultManagement user={user} />} />
        <Route path="results/:examId" element={<ResultManagement user={user} />} />

        {/* Question Bank */}
        <Route path="questions" element={<QuestionBank user={user} />} />
        <Route path="questions/new" element={<QuestionBank user={user} />} />

        {/* Student Management - placeholder for future */}
        <Route path="students" element={
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '64px 24px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a202c',
              margin: '0 0 8px 0'
            }}>
              Quản lý sinh viên
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0
            }}>
              Tính năng đang được phát triển...
            </p>
          </div>
        } />

        {/* Reports - placeholder for future */}
        <Route path="reports" element={
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '64px 24px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a202c',
              margin: '0 0 8px 0'
            }}>
              Báo cáo
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0
            }}>
              Tính năng đang được phát triển...
            </p>
          </div>
        } />

        {/* Settings */}
        <Route path="settings" element={<Settings user={user} />} />

        {/* Profile - placeholder for future */}
        <Route path="profile" element={
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '64px 24px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a202c',
              margin: '0 0 8px 0'
            }}>
              Hồ sơ cá nhân
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0
            }}>
              Tính năng đang được phát triển...
            </p>
          </div>
        } />
      </Route>
    </Routes>
  );
};

export default InstructorRoutes;
