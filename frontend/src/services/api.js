import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  verify: () => api.post('/auth/verify'),
  getUsers: () => api.get('/auth/users'),
  addUser: (data) => api.post('/auth/users', data),
  updateUser: (data) => api.post('/auth/users', data)
};

// Books endpoints
export const booksAPI = {
  getAllBooks: () => api.get('/books'),
  searchBooks: (params) => api.get('/books/search', { params }),
  getBook: (id) => api.get(`/books/${id}`),
  addBook: (data) => api.post('/books', data),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  getAvailableBooks: () => api.get('/books/available/list')
};

// Members endpoints
export const membersAPI = {
  getAllMembers: () => api.get('/members'),
  getMember: (id) => api.get(`/members/${id}`),
  getMemberByName: (name) => api.get(`/members/name/${name}`),
  addMember: (data) => api.post('/members', data),
  updateMember: (id, data) => api.put(`/members/${id}`, data)
};

// Transactions endpoints
export const transactionsAPI = {
  getAllTransactions: () => api.get('/transactions'),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  issueBook: (data) => api.post('/transactions/issue', data),
  returnBook: (id, data) => api.post(`/transactions/return/${id}`, data),
  payFine: (transactionId, data) => api.post(`/transactions/pay-fine/${transactionId}`, data),
  getIssuedBooks: () => api.get('/transactions/issued/books')
};

// Reports endpoints
export const reportsAPI = {
  getTransactionReport: () => api.get('/reports/transactions'),
  getMembershipReport: () => api.get('/reports/membership'),
  getPendingFinesReport: () => api.get('/reports/pending-fines'),
  getBooksReport: () => api.get('/reports/books')
};

export default api;
