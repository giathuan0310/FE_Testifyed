import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockClasses, mockCategories, mockUsers, mockExams, mockExamSchedules } from '../mockData';
import { getClassByIdApi } from '../service/api/apiClass';
const CourseContext = createContext(null);

// Định nghĩa hàm useCourseContext trước
const useCourseContextLogic = () => {
    const context = useContext(CourseContext);

    return context || null;
};

// Component CourseProvider
const CourseProvider = ({ children }) => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            setLoading(true);
            try {
                const res = await getClassByIdApi(courseId);
                // res.data là thông tin lớp học phần từ API
                setCourse(res.data || null);
            } catch (err) {
                setCourse(null);
            }
            setLoading(false);
        };
        if (courseId) {
            fetchCourseDetails();
        } else {
            setLoading(false);
            setCourse(null);
        }
    }, [courseId]);

    return (
        <CourseContext.Provider value={{ course, loading }}>
            {children}
        </CourseContext.Provider>
    );
};

// Export hàm useCourseContext
export { CourseProvider, useCourseContextLogic as useCourseContext };