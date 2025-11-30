import { Routes, Route} from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ArtistDashboard from './pages/ArtistDashboard'
import UploadMusic from './pages/UploadMusic'
import MusicPlayerDetail from './pages/MusicPlayerDetail'
import SearchResults from './pages/SearchResults'
import GoogleCallback from './pages/GoogleCallback'
import Navbar from './components/Navbar'

function App() {
  useEffect(() => {
    // Google OAuth callback - token is now stored in localStorage
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      try {
        // Store token in localStorage
        localStorage.setItem('token', token)
        // Update axios default headers
        import('axios').then(axiosModule => {
          axiosModule.default.defaults.headers.common.Authorization = `Bearer ${token}`
        })
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
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Routes>

      </div>
    </>
  )
}

export default App
