import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../utils/apiClient'
import './Auth.css'

function Auth() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [registerStep, setRegisterStep] = useState('email') // 'email', 'otp', 'details'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    username: '',
    email: '',
    otp: '',
    password: '',
    passwordConfirm: '',
    fullName: '',
    phone: '',
    address: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Request OTP for signup
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format')
      return
    }

    try {
      setLoading(true)
      await apiClient.post('/auth/request-otp', {
        email: formData.email
      })
      setSuccess('✅ OTP sent to your email!')
      setRegisterStep('otp')
      setOtpTimer(600) // 10 minutes
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP and register
  const handleVerifyOTPAndRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.otp || !formData.username || !formData.password || 
        !formData.passwordConfirm || !formData.fullName || !formData.phone) {
      setError('All fields are required')
      return
    }

    if (formData.otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address
      })

      authLogin(response.data.token, response.data.user)
      setSuccess('✅ Registration successful!')
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🍽️ Restaurant App</h1>

        <div className="auth-tabs">
          <button
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login')
              setError('')
              setSuccess('')
            }}
          >
            Login
          </button>
          <button
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register')
              setError('')
              setSuccess('')
            }}
          >
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Username / Email</label>
              <input
                type="text"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                placeholder="Enter username or email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <>
            {registerStep === 'email' && (
              <form onSubmit={handleRequestOTP} className="auth-form">
                <h3>📧 Step 1: Email Verification</h3>
                <p style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '15px' }}>
                  We'll send an OTP code to your email
                </p>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending OTP...' : '📬 Send OTP Code'}
                </button>

                <p style={{ fontSize: '12px', color: '#95a5a6', marginTop: '15px', textAlign: 'center' }}>
                  Already have an account? <a href="#" onClick={(e) => {
                    e.preventDefault()
                    setMode('login')
                  }} style={{ color: '#667eea' }}>Login here</a>
                </p>
              </form>
            )}

            {registerStep === 'otp' && (
              <form onSubmit={handleVerifyOTPAndRegister} className="auth-form">
                <h3>✔️ Step 2: Complete Registration</h3>

                <div className="form-group">
                  <label>OTP Code * <span style={{ fontSize: '11px', color: '#e74c3c' }}>6 digits</span></label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  <small style={{ color: '#7f8c8d' }}>Check your email for the code</small>
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label>Username * <span style={{ fontSize: '11px', color: '#7f8c8d' }}>3-50 chars</span></label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Password * <span style={{ fontSize: '11px', color: '#7f8c8d' }}>Min 6 chars</span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                  />
                </div>

                <div className="form-group">
                  <label>Address (Optional)</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter delivery address"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating Account...' : '✅ Complete Registration'}
                </button>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleBackToEmailStep}
                  style={{ marginTop: '10px' }}
                >
                  ← Back
                </button>
              </form>
            )}
          </>
        )}

        <div className="auth-footer">
          <p>Continue shopping without login → <a href="/">Browse Menu</a></p>
        </div>
      </div>
    </div>
  )
}

export default Auth
