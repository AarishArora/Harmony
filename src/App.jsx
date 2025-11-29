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
    // Google OAuth callback - token is already set as httpOnly cookie
    // Just clean up URL and notify app of auth change
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      try {
        // Dispatch custom event to notify Navbar of auth change
        window.dispatchEvent(new Event('authChange'))
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (e) {
        console.error('Error during auth callback:', e)
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
