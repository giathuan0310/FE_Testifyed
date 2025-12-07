import { useState, useCallback, useEffect } from 'react';
import { 
  getChaptersBySubjectIdApi,
  getTopicsBySubjectAndChapterApi
} from '../service/api/apiQuestion';

export const useChaptersAndTopics = () => {
  const [chapters, setChapters] = useState({});
  const [topics, setTopics] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch chapters by subjectId
  const fetchChaptersBySubjectId = useCallback(async (subjectId) => {
    if (!subjectId) return [];
    
    // Check cache first
    if (chapters[subjectId]) {
      return chapters[subjectId];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const res = await getChaptersBySubjectIdApi(subjectId);
      const chaptersList = Array.isArray(res) ? res : [];
      
      // Cache the result
      setChapters(prev => ({
        ...prev,
        [subjectId]: chaptersList
      }));
      
      return chaptersList;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Không thể tải danh sách chương';
      setError(message);
      console.error('Error fetching chapters:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [chapters]);

  // Fetch topics by subjectId and chapter
  const fetchTopicsBySubjectAndChapter = useCallback(async (subjectId, chapter) => {
    if (!subjectId || !chapter) return [];
    
    const cacheKey = `${subjectId}_${chapter}`;
    
    // Check cache first
    if (topics[cacheKey]) {
      return topics[cacheKey];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const res = await getTopicsBySubjectAndChapterApi(subjectId, chapter);
      const topicsList = Array.isArray(res) ? res : [];
      
      // Cache the result
      setTopics(prev => ({
        ...prev,
        [cacheKey]: topicsList
      }));
      
      return topicsList;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Không thể tải danh sách chủ đề';
      setError(message);
      console.error('Error fetching topics:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [topics]);

  // Get cached chapters for a subject
  const getCachedChapters = useCallback((subjectId) => {
    return chapters[subjectId] || [];
  }, [chapters]);

  // Get cached topics for a subject and chapter
  const getCachedTopics = useCallback((subjectId, chapter) => {
    const cacheKey = `${subjectId}_${chapter}`;
    return topics[cacheKey] || [];
  }, [topics]);

  // Clear cache when needed
  const clearCache = useCallback(() => {
    setChapters({});
    setTopics({});
  }, []);

  // Clear cache for specific subject
  const clearSubjectCache = useCallback((subjectId) => {
    setChapters(prev => {
      const newChapters = { ...prev };
      delete newChapters[subjectId];
      return newChapters;
    });
    
    setTopics(prev => {
      const newTopics = { ...prev };
      Object.keys(newTopics).forEach(key => {
        if (key.startsWith(`${subjectId}_`)) {
          delete newTopics[key];
        }
      });
      return newTopics;
    });
  }, []);

  return {
    // State
    isLoading,
    error,
    
    // Actions
    fetchChaptersBySubjectId,
    fetchTopicsBySubjectAndChapter,
    getCachedChapters,
    getCachedTopics,
    clearCache,
    clearSubjectCache
  };
};