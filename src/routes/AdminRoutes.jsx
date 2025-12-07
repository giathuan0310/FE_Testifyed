import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  ManageUsers,
  ManageClasses,
  ManageSubjects,
  ManageSubjectsEnhanced,
  ManageExams,
  ManageExamSchedules,
  ManageQuestions,
  Settings,
  SimpleAdminDashboard,
  AdminDashboardFixed,
  ApiDataDisplay
} from '../pages/admin';
import AdminLayout from '../layouts/AdminLayout';
import { ResultManagement } from '../pages/Instructor';

const AdminRoutes = ({ user }) => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboardFixed />} />
        <Route path="/dashboard-simple" element={<SimpleAdminDashboard />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/classes" element={<ManageClasses />} />
        <Route path="/subjects" element={<ManageSubjects />} />
        <Route path="/subjects-enhanced" element={<ManageSubjectsEnhanced />} />
        <Route path="/exams" element={<ManageExams />} />
        <Route path="/exam-schedules" element={<ManageExamSchedules />} />
        <Route path="/questions" element={<ManageQuestions />} />
        <Route path="/api-test" element={<ApiDataDisplay />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/results" element={<ResultManagement forAdmin={true} />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
