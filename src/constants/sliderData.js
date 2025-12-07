// Import images from img_slider folder
import img2 from '../assets/img_slider/2.jpg';
import img3 from '../assets/img_slider/3.jpg';
import img4 from '../assets/img_slider/4.jpg';
import img5 from '../assets/img_slider/5.png';
import img6 from '../assets/img_slider/6.jpg';

export const SLIDES_DATA = [
  {
    id: 1,
    title: "Hệ thống Quản lý kiểm tra trực tuyến toàn diện - Testifyed",
    subtitle: "Nền tảng thi cử hiện đại - Đánh giá chính xác - Kết quả minh bạch",
    image: img2,
    gradient: "linear-gradient(135deg, rgba(91, 199, 136, 0.7) 0%, rgba(90, 159, 212, 0.7) 100%)"
  },
  {
    id: 2,
    title: "Tự động hóa quy trình thi cử",
    subtitle: "Tạo đề thi thông minh - Xáo trộn câu hỏi - Chấm điểm tự động",
    image: img3,
    gradient: "linear-gradient(135deg, rgba(79, 172, 254, 0.7) 0%, rgba(0, 242, 254, 0.7) 100%)"
  },
  {
    id: 3,
    title: "Phân tích kết quả chi tiết",
    subtitle: "Thống kê phổ điểm - Đánh giá chất lượng đề thi - Theo dõi năng lực sinh viên",
    image: img4,
    gradient: "linear-gradient(135deg, rgba(91, 199, 136, 0.7) 0%, rgba(90, 159, 212, 0.7) 100%)"

  },
  {
    id: 4,
    title: "Trải nghiệm học tập tối ưu",
    subtitle: "Giao diện hiện đại - Lưu bài tự động - Khôi phục phiên làm việc",
    image: img5,
    gradient: "linear-gradient(135deg, rgba(79, 172, 254, 0.7) 0%, rgba(0, 242, 254, 0.7) 100%)"
  },
  {
    id: 5,
    title: "Đánh giá và Cải tiến liên tục",
    subtitle: "Phân tích xu hướng - Cải thiện chất lượng - Nâng cao hiệu quả học tập",
    image: img6,
    gradient: "linear-gradient(135deg, rgba(91, 199, 136, 0.7) 0%, rgba(90, 159, 212, 0.7) 100%)"

  }
];

export const SLIDER_CONFIG = {
  AUTO_SLIDE_INTERVAL: 8000, // 8 seconds
  TRANSITION_DURATION: 1200  // 1.2 seconds
};
