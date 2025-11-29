import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MdPlayArrow, MdMusicNote } from 'react-icons/md'
import './SearchResults.css'

const SearchResults = () => {

  const Music_Api = import.meta.env.VITE_MUSIC_URL;

  const [searchParams] = useSearchParams()
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const query = searchParams.get('q')

  useEffect(() => {
    if (query) {
      fetchSearchResults(query)
    }
  }, [query])

  const fetchSearchResults = async (searchQuery) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${Music_Api}/api/music/search`, {
        params: { query: searchQuery },
        withCredentials: true
      })

      setSearchResults(response.data.musics.map(m => ({
        id: m._id,
        title: m.title,
        artist: m.artist,
        coverImageUrl: m.coverImageUrl,
        musicUrl: m.musicUrl,
      })))
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to fetch search results')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (musicId) => {
    navigate(`/music/${musicId}`)
  }

  const handlePlayButtonClick = (e, musicId) => {
    e.stopPropagation()
    navigate(`/music/${musicId}`)
  }

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h1>Search Results for "{query}"</h1>
        <p className="results-count">
          {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p className="error-message">{error}</p>
        </div>
      )}

      {!loading && searchResults.length === 0 && !error && (
        <div className="empty-state">
          <MdMusicNote size={64} color="#888" />
          <p>No results found for "{query}"</p>
          <p className="empty-subtitle">Try searching with different keywords</p>
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="search-results-grid">
          {searchResults.map(music => (
            <div 
              key={music.id} 
              className="search-result-card"
              onClick={() => handleCardClick(music.id)}
            >
              <div className="result-image-container">
                <img 
                  src={music.coverImageUrl} 
                  alt={music.title}
                  className="result-image"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
                />
                <button 
                  className="play-button"
                  onClick={(e) => handlePlayButtonClick(e, music.id)}
                  title="Play music"
                >
                  <MdPlayArrow size={32} />
                </button>
              </div>
              <div className="result-info">
                <h3 className="result-title">{music.title}</h3>
                <p className="result-artist">{music.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchResults
