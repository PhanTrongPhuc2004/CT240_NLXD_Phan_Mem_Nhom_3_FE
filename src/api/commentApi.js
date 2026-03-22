import axios from 'axios';

const API_URL = 'http://localhost:8080/api/comments';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token'); 
  const userId = localStorage.getItem('userId');   

  return {
    headers: {
      'userId': userId,
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

export const commentApi = {
  addComment(taskId, content, files = [], userId, parentId = null) {
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('content', content);
    formData.append('userId', userId);

    // Nếu có parentId (tức là đang trả lời), hãy gửi nó lên
    if (parentId) {
      formData.append('parentId', parentId);
    }
    
    // 2. NẾU có file thì mới chạy vòng lặp nhét thêm file vào
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file); 
      });
    }

    // 3. Gửi đi (Lúc này formData luôn luôn tồn tại, dù có file hay không)
    return axios.post(API_URL, formData, getHeaders());
  },

  getCommentsByTask(taskId) {
    return axios.get(`${API_URL}/task/${taskId}`, getHeaders());
  },

  updateComment(commentId, content) {
    return axios.put(`${API_URL}/${commentId}`, { content }, getHeaders());
  },

  deleteComment(commentId) {
    return axios.delete(`${API_URL}/${commentId}`, getHeaders());
  }
};