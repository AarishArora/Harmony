import React, { useState, useEffect } from 'react'
import './Home.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MdMusicNote, MdPlaylistPlay, MdPlayArrow, MdEdit, MdDelete } from 'react-icons/md'

const Home = () => {

  const Music_Api = import.meta.env.VITE_MUSIC_URL;
  
  const [musics, setMusics] = useState([
      { id: 'm1', title: 'Midnight Echoes', artist: 'Alex Wave', coverImageUrl: 'https://via.placeholder.com/300?text=M1' },
      { id: 'm2', title: 'Golden Skies', artist: 'Luna Sun', coverImageUrl: 'https://via.placeholder.com/300?text=M2' },
      { id: 'm3', title: 'Fading Lights', artist: 'Neon Drift', coverImageUrl: 'https://via.placeholder.com/300?text=M3' },
      { id: 'm4', title: 'Ocean Drift', artist: 'Deep Current', coverImageUrl: 'https://via.placeholder.com/300?text=M4' },
      { id: 'm5', title: 'Solstice', artist: 'Alex Wave', coverImageUrl: 'https://via.placeholder.com/300?text=M5' },
      { id: 'm6', title: 'Night Sparks', artist: 'Luna Sun', coverImageUrl: 'https://via.placeholder.com/300?text=M6' },
    ])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('musics')
  const [creatingPlaylist, setCreatingPlaylist] = useState(false)
  const [editingPlaylistId, setEditingPlaylistId] = useState(null)
  const [editingPlaylistName, setEditingPlaylistName] = useState('')
  const [updatingPlaylist, setUpdatingPlaylist] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [playlistSongs, setPlaylistSongs] = useState([])
  const [loadingPlaylistSongs, setLoadingPlaylistSongs] = useState(false)
  const token = localStorage.getItem('token')

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch musics
        const musicsResponse = await axios.get(`${Music_Api}/api/music`, {
          withCredentials: true
        })

        setMusics(musicsResponse.data.musics.map(m => ({
          id: m._id,
          title: m.title,
          artist: m.artist,
          coverImageUrl: m.coverImageUrl,
          musicUrl: m.musicUrl,
        })))

        // Fetch playlists
        const playlistsResponse = await axios.get(`${Music_Api}/api/music/playlist`, {
          withCredentials: true
        })

        setPlaylists(playlistsResponse.data.playlists || [])

      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchData()
    } else {
      setError('Please login to view content')
      setLoading(false)
    }
  }, [token])

  const handlePlayMusic = (musicUrl) => {
    // This can be integrated with a music player component
    console.log('Playing music:', musicUrl)
    const audio = new Audio(musicUrl)
    audio.play().catch(err => console.error('Error playing music:', err))
  }

  const handleCreateMyFavouritePlaylist = async () => {
    try {
      setCreatingPlaylist(true)
      const response = await axios.post(`${Music_Api}/api/music/playlist`, 
        {
          title: "My Favourite",
          musics: []
        },
        {
          withCredentials: true
        }
      )

      if (response.status === 201) {
        setPlaylists([...playlists, response.data.playlist])
        setActiveTab('playlists')
        console.log('Playlist created successfully:', response.data.playlist)
      }
    } catch (err) {
      console.error('Error creating playlist:', err)
      alert('Failed to create playlist. Please try again.')
    } finally {
      setCreatingPlaylist(false)
    }
  }

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylistId(playlist._id)
    setEditingPlaylistName(playlist.title)
  }

  const handleUpdatePlaylistName = async (playlistId) => {
    if (!editingPlaylistName.trim()) {
      alert('Playlist name cannot be empty')
      return
    }

    try {
      setUpdatingPlaylist(true)
      const response = await axios.put(`${Music_Api}/api/music/playlist/${playlistId}`, 
        {
          title: editingPlaylistName
        },
        {
          withCredentials: true
        }
      )

      if (response.status === 200) {
        setPlaylists(playlists.map(p => 
          p._id === playlistId ? { ...p, title: editingPlaylistName } : p
        ))
        setEditingPlaylistId(null)
        setEditingPlaylistName('')
        console.log('Playlist updated successfully')
      }
    } catch (err) {
      console.error('Error updating playlist:', err)
      alert('Failed to update playlist. Please try again.')
    } finally {
      setUpdatingPlaylist(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingPlaylistId(null)
    setEditingPlaylistName('')
  }

  const handleDeletePlaylist = async (playlistId, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return
    }

    try {
      const response = await axios.delete(`${Music_Api}/api/music/playlist/${playlistId}`, {
        withCredentials: true
      })

      if (response.status === 200) {
        setPlaylists(playlists.filter(p => p._id !== playlistId))
        if (selectedPlaylist?._id === playlistId) {
          setSelectedPlaylist(null)
          setPlaylistSongs([])
        }
        console.log('Playlist deleted successfully')
      }
    } catch (err) {
      console.error('Error deleting playlist:', err)
      alert('Failed to delete playlist. Please try again.')
    }
  }

  const handlePlaylistClick = async (playlist) => {
    try {
      setLoadingPlaylistSongs(true)
      const response = await axios.get(`${Music_Api}/api/music/playlist/${playlist._id}`, {
        withCredentials: true
      })

      if (response.status === 200) {
        setSelectedPlaylist(playlist)
        setPlaylistSongs(response.data.playlist.musics || [])
      }
    } catch (err) {
      console.error('Error fetching playlist songs:', err)
      alert('Failed to load playlist songs. Please try again.')
    } finally {
      setLoadingPlaylistSongs(false)
    }
  }

  if (loading) {
    return <div className="home-container"><div className="loading">Loading...</div></div>
  }

  if (error) {
    return <div className="home-container"><div className="error">{error}</div></div>
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to <a className= "heading">Harmony</a></h1>
        <p>~A Clean and ad-free Music Platform~</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'musics' ? 'active' : ''}`}
          onClick={() => setActiveTab('musics')}
        >
          <MdMusicNote style={{ marginRight: '8px' }} /> Music ({musics.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          <MdPlaylistPlay style={{ marginRight: '8px' }} /> Playlists ({playlists.length})
        </button>
      </div>

      {/* Musics Section */}
      {activeTab === 'musics' && (
        <div className="content-section">
          <h2>All Musics</h2>
          {musics.length === 0 ? (
            <div className="empty-state">
              <p>No musics available yet. Check back later!</p>
            </div>
          ) : (
            <div className="music-grid">
              {musics.map((music) => (
                <div key={music._id} className="music-card" onClick={()=> navigate(`/music/${music.id}`)}>
                  <div className="music-card-image" >
                    {music.coverImageUrl ? (
                      <img src={music.coverImageUrl} alt={music.title} />
                    ) : (
                      <div className="image-placeholder"><MdMusicNote size={50} /></div>
                    )}
                    <button
                      className="play-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/music/${music.id}`)
                      }}
                      title="Play music"
                      
                    >
                      <MdPlayArrow size={24} />
                    </button>
                  </div>
                  <div className="music-card-content">
                    <h3 className="music-title">{music.title}</h3>
                    <p className="music-artist">{music.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playlists Section */}
      {activeTab === 'playlists' && (
        <div className="content-section">
          <div className="playlists-header">
            <h2>Playlists</h2>
            <button 
              className="create-playlist-btn"
              onClick={handleCreateMyFavouritePlaylist}
              disabled={creatingPlaylist}
            >
              {creatingPlaylist ? 'Creating...' : '+ Create My Favourite'}
            </button>
          </div>
          {playlists.length === 0 ? (
            <div className="empty-state">
              <p>No playlists available yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="playlists-container">
              <div className="playlist-grid">
                {playlists.map((playlist) => (
                  <div 
                    key={playlist._id} 
                    className={`playlist-card ${selectedPlaylist?._id === playlist._id ? 'active' : ''}`}
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    {editingPlaylistId === playlist._id ? (
                      <div className="playlist-edit-mode">
                        <input
                          type="text"
                          className="playlist-name-input"
                          value={editingPlaylistName}
                          onChange={(e) => setEditingPlaylistName(e.target.value)}
                          placeholder="Playlist name"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="edit-buttons">
                          <button
                            className="save-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdatePlaylistName(playlist._id)
                            }}
                            disabled={updatingPlaylist}
                          >
                            {updatingPlaylist ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelEdit()
                            }}
                            disabled={updatingPlaylist}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="playlist-card-top">
                          <div className="playlist-title-section">
                            <h3 className="playlist-title">{playlist.title}</h3>
                            <button
                              className="edit-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditPlaylist(playlist)
                              }}
                              title="Edit playlist name"
                            >
                              <MdEdit size={18} />
                            </button>
                          </div>
                          <button
                            className="delete-btn"
                            onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                            title="Delete playlist"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                        <span className="playlist-count">{playlist.musics?.length || 0} songs</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Playlist Songs Display */}
              {selectedPlaylist && (
                <div className="playlist-songs-section">
                  <div className="playlist-songs-header">
                    <h3>Songs in "{selectedPlaylist.title}"</h3>
                    <button 
                      className="close-songs-btn"
                      onClick={() => {
                        setSelectedPlaylist(null)
                        setPlaylistSongs([])
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  {loadingPlaylistSongs ? (
                    <div className="loading">Loading songs...</div>
                  ) : playlistSongs.length === 0 ? (
                    <div className="empty-state">
                      <p>No songs in this playlist yet. Add songs to get started!</p>
                    </div>
                  ) : (
                    <div className="playlist-songs-list">
                      {playlistSongs.map((song, index) => (
                        <div key={song._id} className="playlist-song-item">
                          <div className="song-number">{index + 1}</div>
                          <div className="song-image">
                            {song.coverImageUrl ? (
                              <img src={song.coverImageUrl} alt={song.title} />
                            ) : (
                              <div className="image-placeholder"><MdMusicNote size={30} /></div>
                            )}
                          </div>
                          <div className="song-details">
                            <h4 className="song-title">{song.title}</h4>
                            <p className="song-artist">{song.artist}</p>
                          </div>
                          <button
                            className="play-song-btn"
                            onClick={() => navigate(`/music/${song._id}`)}
                            title="Play song"
                          >
                            <MdPlayArrow size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Home
