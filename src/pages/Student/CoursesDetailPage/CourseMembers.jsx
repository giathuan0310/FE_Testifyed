import React from 'react';
import { useCourseContext } from '../../../context/CourseContext'; // Import hook
import './styles/CourseMembers.css';

const CourseMembers = () => {
    const { course } = useCourseContext(); // Lấy dữ liệu từ context

    if (!course || !course.studentIds) return <p className="cdm-empty">Không có dữ liệu thành viên.</p>;

    return (
        <div className="cdm-tab-content">
            <h3 className="cdm-tab-title">Danh sách thành viên</h3>
            <div className="cdm-member-list">
                {course.studentIds.length > 0 ? (
                    course.studentIds.map(member => (
                        <div key={member._id} className="cdm-member-item">
                            <div className="cdm-member-avatar">
                                {member.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="cdm-member-details">
                                <p className="cdm-member-name">{member.fullName}</p>
                                <p className="cdm-member-code">{member.code}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="cdm-empty">Không có thành viên nào trong khóa học này.</p>
                )}
            </div>
        </div>
    );
};

export default CourseMembers;