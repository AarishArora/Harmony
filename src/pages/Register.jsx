import React, { useState } from 'react';
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

export default function Register() {

  const Auth_Api = import.meta.env.VITE_AUTH_URL;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'user'
  })

  function handleInputChange (e){
    const { name, value } = e.target
    setFormData(f => ({...f, [name]: value}))
    // if (name === 'firstName' || name === 'lastName') {
    //   setFormData(prev => ({
    //     ...prev,
    //       ...prev.fullname,
    //       [name]: value
        
    //   }))
    // } else {
    //   setFormData(prev => ({
    //     ...prev,
    //     [name]: value
    //   }))
    // }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post(`${Auth_Api}/api/auth/register`, {
      email: formData.email,
      fullname:{
        firstName:formData.firstName,
        lastName:formData.lastName
      },
      password: formData.password,
      role: formData.role
    })

    if(response.data.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token)
      // Update axios default headers
      axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`
      // Dispatch custom event to notify Navbar of auth change
      window.dispatchEvent(new Event('authChange'))
      navigate("/")
    };

    } catch (error) {
        console.log("Error during registration", error);
    }
    
    // console.log('Form submitted:', formData)
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create your account</h2>
        
        <div className="register-content">
          {/* Left Column - Form */}
          <div className="register-left">
            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
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
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="btn-submit">Create account</button>
            </form>
          </div>

          {/* Vertical Divider */}
          <div className="vertical-divider"></div>

          {/* Right Column - Auth Options & User Type */}
          <div className="register-right">
            <div>
              <label className="section-label">Account Type</label>
              <div className="radio-group-vertical">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleInputChange}
                  />
                  <span>User</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="artist"
                    checked={formData.role === 'artist'}
                    onChange={handleInputChange}
                  />
                  <span>Artist</span>
                </label>
              </div>
            </div>

            <div className="divider-horizontal"></div>

            <button
              onClick={()=> {
                window.location.href = `${Auth_Api}/api/auth/google`
              }}
            type="button" className="btn-google">
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <p className="login-link">
              Already have an account? <a href="/login">Login here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
