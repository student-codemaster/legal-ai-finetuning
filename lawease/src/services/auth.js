import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

class AuthService {
  static async login(username, password) {
    try {
      // Use URL encoded form data for FastAPI
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)
      
      const response = await axios.post(`${API_BASE}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      
      if (response.data.access_token) {
        const userData = {
          ...response.data.user,
          token: response.data.access_token
        }
        localStorage.setItem('user', JSON.stringify(userData))
        return userData
      }
      
      throw new Error('No access token received')
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.detail || 'Login failed. Please check your credentials.')
    }
  }

  static async signup(userData) {
    try {
      // Use URL encoded form data for FastAPI
      const formData = new URLSearchParams()
      formData.append('username', userData.username)
      formData.append('email', userData.email)
      formData.append('password', userData.password)
      if (userData.full_name) {
        formData.append('full_name', userData.full_name)
      }
      
      const response = await axios.post(`${API_BASE}/register`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      
      if (response.data.access_token) {
        const userData = {
          ...response.data.user,
          token: response.data.access_token
        }
        localStorage.setItem('user', JSON.stringify(userData))
        return userData
      }
      
      throw new Error('No access token received')
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.detail || 'Registration failed. Please try again.')
    }
  }

  static logout() {
    localStorage.removeItem('user')
  }

  static getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  }

  static isAuthenticated() {
    const user = this.getCurrentUser()
    return !!(user && user.token)
  }

  static isAdmin() {
    const user = this.getCurrentUser()
    return !!(user && user.is_admin)
  }

  static getAuthHeader() {
    const user = this.getCurrentUser()
    if (user && user.token) {
      return { 'Authorization': `Bearer ${user.token}` }
    }
    return {}
  }

  // Verify token with backend
  static async verifyToken() {
    try {
      const user = this.getCurrentUser()
      if (!user || !user.token) {
        return false
      }
      
      const response = await axios.get(`${API_BASE}/verify-token`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      
      return response.data.valid
    } catch (error) {
      console.error('Token verification failed:', error)
      this.logout()
      return false
    }
  }
}

export default AuthService