import React, { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
export default function Login() {

  const Auth_Api = import.meta.env.VITE_AUTH_URL;


  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {

    e.preventDefault()
    // console.log('Form submitted:', formData)
    
    try {
      const res = await axios.post(`${Auth_Api}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      })

      // store token
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`
      }

      // store user
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }

      // notify navbar
      window.dispatchEvent(new Event('tokenUpdated'))

      navigate("/")

    } 
    catch (error) {
        console.log("Login Error:", error)
    }


  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome back</h2>
        
        <div className="login-content">
          {/* Left Column - Form */}
          <div className="login-left">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="btn-submit">Sign in</button>
            </form>
          </div>

          {/* Vertical Divider */}
          <div className="vertical-divider"></div>

          {/* Right Column - Auth Options */}
          <div className="login-right">
            <button type="button" className="btn-google"
              onClick={()=> {
                window.location.href = `${Auth_Api}/api/auth/google?redirect=/`;

              }}
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <p className="signup-link">
              Don't have an account? <a href="/register">Sign up here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
