import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardContent, MyCoursesPage, ProfilePage, DashBoard } from '../pages/Student';
import HeroSlider from '../components/ui/HeroSlider';
import { CourseProvider } from '../context/CourseContext';

import CourseOverview from '../pages/Student/CoursesDetailPage/CourseOverview';
import CourseQuizzes from '../pages/Student/CoursesDetailPage/CourseQuizzes';
import CourseMembers from '../pages/Student/CoursesDetailPage/CourseMembers';
import CourseGrades from '../pages/Student/CoursesDetailPage/CourseGrades';
import CourseDetailPage from '../pages/Student/CoursesDetailPage/CourseDetailPage';
import QuizDetailPage from '../pages/Student/CoursesDetailPage/QuizDetailPage';
import QuizTakingPage from '../pages/Student/CoursesDetailPage/QuizTakingPage';
import ExamReviewPage from '../pages/Student/CoursesDetailPage/ExamReviewPage';
import AllScoresPage from '../pages/Student/AllScoresPage/AllScoresPage';
const StudentRoutes = () => {
  return (
    <Routes>
      {/* Redirect từ /student tự động sang /student/dashboard */}
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />

      {/* Student Dashboard with nested routes */}
      <Route path="/dashboard" element={<DashBoard />} >
        <Route index element={<DashboardContent />} />
        <Route path="trang-chu" element={<HeroSlider />} />
        <Route path="my-courses" element={<MyCoursesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="score" element={<AllScoresPage />} />
        <Route path="my-courses/:courseId" element={<CourseProvider><CourseDetailPage /></CourseProvider>}>
          <Route index element={<CourseOverview />} />
          <Route path="quizzes" element={<CourseQuizzes />} />
          <Route path="quizzes/:quizId" element={<QuizDetailPage />} />
          <Route path="quizzes/:quizId/take" element={<QuizTakingPage />} />
          <Route path="quizzes/:quizId/review" element={<ExamReviewPage />} />
          <Route path="members" element={<CourseMembers />} />
          <Route path="grades" element={<CourseGrades />} />


        </Route>
        {/* Xóa route chi tiết bài kiểm tra ngoài context course */}
      </Route>


    </Routes>
  );
};

export default StudentRoutes;
