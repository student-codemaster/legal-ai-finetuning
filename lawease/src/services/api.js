import axios from 'axios'
import AuthService from './auth'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getCurrentUser()?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const legalAPI = {
  // File processing
  processFile: async (file, language = null) => {
    const formData = new FormData()
    formData.append('file', file)
    if (language && language !== 'auto') {
      formData.append('lang', language)
    }
    
    const response = await api.post('/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Text processing
  processText: async (text, language = null) => {
    const payload = { text }
    if (language && language !== 'auto') {
      payload.lang = language
    }
    
    const response = await api.post('/process-text', payload)
    return response.data
  },

  // User management
  getProfile: async () => {
    const response = await api.get('/user/profile')
    return response.data
  },

  getUserQueries: async (skip = 0, limit = 50) => {
    const response = await api.get(`/user/queries?skip=${skip}&limit=${limit}`)
    return response.data
  },

  submitFeedback: async (feedbackData) => {
    const response = await api.post('/user/feedback', feedbackData)
    return response.data
  }
}

export default api