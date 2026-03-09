import axios from 'axios';

const API_URL = 'http://localhost:8080/api/comments';

// Hàm lấy Headers dùng chung
const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('auth_token'); // Khớp với Key trong Local Storage của bạn
  const userId = localStorage.getItem('userId');   // Lấy ID người dùng đang đăng nhập

  const headers = {
    'userId': userId,
    'Authorization': token ? `Bearer ${token}` : ''
  };

  // Nếu gửi file thì phải đổi Content-Type
  if (isFormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }

  return { headers };
};

export const commentApi = {
  // CN_24: Thêm bình luận CÓ ĐÍNH KÈM FILE
  // taskId: ID công việc, content: nội dung chữ, files: Array các file đã chọn
  addComment(taskId, content, files = []) {
    if (files.length > 0) {
      // Trường hợp có file: Dùng FormData
      const formData = new FormData();
      formData.append('taskId', taskId);
      formData.append('content', content);
      
      // Đưa từng file vào form
      files.forEach(file => {
        formData.append('files', file); 
      });

      return axios.post(`${API_URL}/upload`, formData, getHeaders(true));
    } else {
      // Trường hợp chỉ có chữ: Gửi JSON như cũ cho nhẹ
      return axios.post(API_URL, { taskId, content }, getHeaders());
    }
  },

  // CN_25: Lấy danh sách bình luận (để nút "Xem thêm" hoạt động)
  getCommentsByTask(taskId) {
    return axios.get(`${API_URL}/task/${taskId}`, getHeaders());
  },

  // CN_26: Cập nhật bình luận
  updateComment(commentId, content) {
    return axios.put(`${API_URL}/${commentId}`, { content }, getHeaders());
  },

  // CN_26: Xóa bình luận
  deleteComment(commentId) {
    return axios.delete(`${API_URL}/${commentId}`, getHeaders());
  }
};