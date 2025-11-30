import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CiSearch } from 'react-icons/ci'
import { HiMenu, HiX } from 'react-icons/hi'
import './Navbar.css'

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
    }

    checkAuthStatus()

    // Listen for custom auth change events
    const handleAuthChange = () => {
      checkAuthStatus()
    }

    window.addEventListener('authChange', handleAuthChange)
    window.addEventListener('tokenUpdated', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('tokenUpdated', handleAuthChange)
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
    delete window.axios?.defaults?.headers?.common?.Authorization
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