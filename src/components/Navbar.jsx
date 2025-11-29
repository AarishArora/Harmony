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
    // Check if user is logged in by checking cookies
    const checkAuthStatus = () => {
      // Token is automatically sent in requests with credentials: include
      // Just check if we can read the cookie to display UI
      const token = getCookie('token')
      setIsLoggedIn(!!token)
    }

    checkAuthStatus()

    // Listen for custom auth change events
    const handleAuthChange = () => {
      checkAuthStatus()
    }

    window.addEventListener('authChange', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
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