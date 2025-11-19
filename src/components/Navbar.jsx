import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CiSearch } from 'react-icons/ci'
import { HiMenu, HiX } from 'react-icons/hi'
import { getCookie } from '../utils/cookieUtils'
import './Navbar.css'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in by checking for token in localStorage or cookies
    const checkAuthStatus = () => {
      let token = localStorage.getItem('token')
      
      // If no token in localStorage, check if it's in cookies (from Google OAuth redirect)
      if (!token) {
        token = getCookie('token')
        if (token) {
          localStorage.setItem('token', token)
        }
      }
      
      const userData = localStorage.getItem('user')
      setIsLoggedIn(!!token)
      if(userData) {
        setUser(JSON.parse(userData))
      }
    }

    checkAuthStatus()

    // Listen for custom auth change events
    const handleAuthChange = () => {
      checkAuthStatus()
    }

    // Listen for localStorage changes (works when redirect happens from Google OAuth)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthStatus()
      }
    }

    window.addEventListener('authChange', handleAuthChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      closeMenu()
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    closeMenu()
    navigate('/')
  }

  return (
    <nav className="navbar">
      {/* Left Section - Site Name */}
      <div className="navbar-left">
        <Link to="/" className="site-name">
          Harmony
        </Link>
      </div>

      {/* Center Section - Search Bar */}
      <div className="navbar-center">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search songs, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            <CiSearch size={20} color="white" />
          </button>
        </form>
      </div>

      {/* Hamburger Menu Button */}
      <button className="hamburger-menu" onClick={toggleMenu}>
        {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Right Section - Navigation Links */}
      <div className={`navbar-right ${isMenuOpen ? 'active' : ''}`}>
        {isLoggedIn ? (
          <>
            {user?.role === 'artist' && (
              <Link 
                to="/artist/dashboard" 
                className="nav-link" 
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            )}
            <button 
              className="nav-link nav-link-primary" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/register" className="nav-link nav-link-primary" onClick={closeMenu}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar