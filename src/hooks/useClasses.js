import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  generateClassId,
  generatePassJoin,
  validateClassForm,
  calculateClassStats,
  filterItems
} from '../utils/instructor';
import { DEFAULT_VALUES } from '../constants/instructor';
import {
  getAllClassApi,
  getClassByIdApi,
  createClassApi,
  updateClassApi,
  deleteClassApi,
  joinClassApi,
  addStudentToClassApi,
  removeStudentFromClassApi,
  getMyClassesApi
} from '../service/api/apiClass';

import { useAppStore } from '../store/appStore';
import { getAllClassesForAdminApi } from '../service/api/apiAdmin';
export const useClasses = (opts = {}) => {
  const { forAdmin = false } = opts;
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchClasses = async () => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       const res = await getAllClassApi();
  //       setClasses(res.data || []);
  //     } catch (err) {
  //       setError('Không thể tải danh sách lớp học');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchClasses();
  // }, []);

  // Lấy user + trạng thái load app từ Zustand
  const user = useAppStore(state => state.user);
  const isAppLoading = useAppStore(state => state.isAppLoading);
  useEffect(() => {
    let mounted = true;
    const fetchClasses = async () => {
      // Nếu app còn đang load tài khoản, chờ
      if (isAppLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        const role = user?.role || '';
        let res;
        if (forAdmin) {
          res = await getAllClassesForAdminApi();
        } else if (role === 'STUDENT') {

          res = await getMyClassesApi();
        } else {

          try {
            res = await getAllClassApi();
          } catch (err) {

            // Nếu server trả 403 cho getAllClassApi -> thử gọi my-classes thay vì ném lỗi (tiện debug)
            if (err?.response?.status === 403) {

              res = await getMyClassesApi();
            } else {
              throw err;
            }
          }
        }
        // đảm bảo luôn là mảng
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
        // normalize instructor fields
        const normalized = (list || []).map(item => {
          const teacherObj = item.teacherId || item.teacher || item.instructor || item.instructorId || item.owner || item.createdBy || null;
          const instructorName = teacherObj?.fullName || teacherObj?.name || item.teacherName || item.instructorName || '';
          return { ...item, instructorName, teacherObj };
        });

        if (mounted) setClasses(normalized);
      } catch (err) {

        if (mounted) setError(err?.response?.data?.message || err.message || 'Không thể tải danh sách lớp học');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchClasses();

    return () => {
      mounted = false;
    };
  }, [user, isAppLoading, forAdmin]);

  // Add new class (call API)
  const addClass = useCallback(async (classData) => {
    setIsLoading(true);
    setError(null);
    try {
      const errors = validateClassForm(classData);
      if (Object.keys(errors).length > 0) {
        throw new Error('Dữ liệu không hợp lệ');
      }
      const res = await createClassApi(classData);
      setClasses(prev => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message || 'Thêm lớp học thất bại');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update class (call API)
  const updateClass = useCallback(async (classId, updateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const errors = validateClassForm(updateData);
      if (Object.keys(errors).length > 0) {
        throw new Error('Dữ liệu không hợp lệ');
      }
      const res = await updateClassApi(classId, updateData);
      setClasses(prev =>
        prev.map(classItem =>
          classItem._id === classId ? res.data : classItem
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.message || 'Cập nhật lớp học thất bại');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete class (call API)
  const deleteClass = useCallback(async (classId) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteClassApi(classId);
      setClasses(prev => prev.filter(classItem => classItem._id !== classId));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Xóa lớp học thất bại');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate new pass join code
  const regeneratePassJoin = useCallback((classId) => {
    const newPassJoin = generatePassJoin();
    setClasses(prev =>
      prev.map(classItem =>
        classItem._id === classId
          ? { ...classItem, passJoin: newPassJoin }
          : classItem
      )
    );
    return newPassJoin;
  }, []);

  // Get class by ID (call API)
  const getClassById = useCallback(async (classId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getClassByIdApi(classId);
      return res.data;
    } catch (err) {
      setError(err.message || 'Không thể lấy thông tin lớp học');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add student to class (call API)
  const addStudentToClass = useCallback(async (classId, studentCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addStudentToClassApi(classId, studentCode);
      // Nếu API trả về thành công (HTTP 200)
      return { success: true, data: res.data };
    } catch (err) {
      // Lấy message cụ thể từ backend nếu có
      const message = err.response?.data?.message || 'Thêm sinh viên thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove student from class (call API)
  const removeStudentFromClass = useCallback(async (classId, studentCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await removeStudentFromClassApi(classId, studentCode);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message || 'Xóa sinh viên thất bại');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join class (call API)
  const joinClass = useCallback(async (codeJoin, passJoin) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await joinClassApi(codeJoin, passJoin);
      setClasses(prev => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Tham gia lớp học thất bại';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get my classes (call API)
  const getMyClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyClassesApi();
      setClasses(res.data || []);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách lớp học của bạn');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Filtered classes based on search
  const filteredClasses = useMemo(() => {
    return filterItems(classes, searchTerm, ['name', 'code']);
  }, [classes, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    return calculateClassStats(classes);
  }, [classes]);

  return {
    // Data
    classes,
    filteredClasses,
    stats,

    // State
    searchTerm,
    setSearchTerm,
    isLoading,
    error,

    // Actions
    addClass,
    updateClass,
    deleteClass,
    regeneratePassJoin,
    getClassById,
    addStudentToClass,
    removeStudentFromClass,
    joinClass,
    getMyClasses,

    // Utils
    generateNewPassJoin: generatePassJoin,
    defaultValues: DEFAULT_VALUES.CLASS
  };
};