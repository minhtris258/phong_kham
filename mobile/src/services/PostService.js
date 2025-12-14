// services/PostService.js
import api from '../api/axiosClient';

const postService = {
  // Đổi từ listPosts → getPosts cho thống nhất với frontend
  getPosts: (params = {}) => api.get('/posts', { params }), // quan trọng: truyền params để search, page, status...

  getPostBySlug: (slug) => api.get(`/posts/slug/${slug}`),
  getPostById: (id) => api.get(`/posts/${id}`),
  relatedPosts: (id) => api.get(`/posts/${id}/related`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
};

export default postService;
