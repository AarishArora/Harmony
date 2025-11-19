import { Routes, Route} from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ArtistDashboard from './pages/ArtistDashboard'
import UploadMusic from './pages/UploadMusic'
import MusicPlayerDetail from './pages/MusicPlayerDetail'
import SearchResults from './pages/SearchResults'
import Navbar from './components/Navbar'

function App() {
  useEffect(() => {
    // Check for token and user in URL query parameters (from Google OAuth redirect)
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const user = params.get('user')

    if (token && user) {
      try {
        localStorage.setItem('token', token)
        localStorage.setItem('user', user)
        // Dispatch custom event to notify Navbar of auth change
        window.dispatchEvent(new Event('authChange'))
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (e) {
        console.error('Error setting auth from URL params:', e)
      }
    }
  }, [])

  return (
    <>
      <Navbar/>
      <div className="app-root">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/artist/dashboard" element={<ArtistDashboard />} />
          <Route path="/artist/dashboard/upload-music" element={<UploadMusic />} />
          <Route path="/music/:id" element={<MusicPlayerDetail />} />
        </Routes>

      </div>
    </>
  )
}

export default App
