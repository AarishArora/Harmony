import React, {useEffect, useState} from 'react'
import './ArtistDashboard.css'
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function ArtistDashboard() {

    const Music_Api = import.meta.env.VITE_MUSIC_URL;

    const navigate = useNavigate();
  // Mock data for demonstration
  const stats = [
    { label: 'TOTAL PLAYS', value: '50,550' },
    { label: 'MUSICS', value: '5' },
    { label: 'PLAYLISTS', value: '3' },
    { label: 'FOLLOWERS', value: '10,100' }
  ]

  const [musics, setMusics] = useState([
  ]) 

  const [playlists, setPlaylists] = useState([
  ])

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMusics, setSelectedMusics] = useState(new Set());

  useEffect(()=> {
    axios.get(`${Music_Api}/api/music/artist-musics`)
    .then(res=> {
        setMusics(res.data.musics.map(m=> ({
            id: m._id,
            title: m.title,
            artist: m.artist,
            coverImageUrl: m.coverImageUrl,
            musicUrl: m.musicUrl,
            plays: m.plays || 0,
            duration: m.duration || '3:00',
            released: m.released ? new Date(m.released).toISOString().split('T')[0]: "2024-01-01"
        })));
    })

    axios.get(`${Music_Api}/api/music/playlist/artist`)
            .then(res => {
                setPlaylists(res.data.playlists.map(p => ({
                    id: p._id,
                    title: p.title,
                    artist: p.artist,
                    followers: p.followers || 0,
                    updated: p.updated ? `${Math.floor((Date.now() - new Date(p.updated).getTime()) / (1000 * 60 * 60 * 24))}d ago` : 'N/A',
                    musics: p.musics || []
                })));
            })
  },[])

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedMusics(new Set());
  };

  const toggleMusicSelection = (musicId) => {
    const newSelected = new Set(selectedMusics);
    if (newSelected.has(musicId)) {
      newSelected.delete(musicId);
    } else {
      newSelected.add(musicId);
    }
    setSelectedMusics(newSelected);
  };

  const deleteSelectedMusics = async () => {
    if (selectedMusics.size === 0) return;

    try {
      for (const musicId of selectedMusics) {
        await axios.delete(`${Music_Api}/api/music/${musicId}`);
      }
      // Remove deleted musics from state
      setMusics(musics.filter(music => !selectedMusics.has(music.id)));
      setSelectedMusics(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error("Error deleting musics:", error);
      alert("Error deleting musics. Please try again.");
    }
  };

  return (
    <div className="artist-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Artist Dashboard</h1>
            <p className="header-subtitle">Overview of your content performance</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={()=>navigate('/artist/dashboard/upload-music')}>+ New Track</button>
            <button className="btn btn-secondary">+ New Playlist</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Musics Section */}
          <div className="content-section musics-section">
            <div className="section-header">
              <h2>Musics</h2>
              <div className="music-actions">
                <button className="btn-manage" onClick={toggleSelectMode}>
                  {isSelectMode ? 'Unselect' : 'Select'}
                </button>
                {isSelectMode && selectedMusics.size > 0 && (
                  <button className="btn-delete" onClick={deleteSelectedMusics}>
                    Delete ({selectedMusics.size})
                  </button>
                )}
              </div>
            </div>
            <div className="musics-table">
              <div className="table-header">
                {isSelectMode && <div className="col-checkbox"></div>}
                <div className="col-title">TITLE</div>
                <div className="col-artist">ARTIST</div>
                <div className="col-plays">PLAYS</div>
                <div className="col-duration">DURATION</div>
                <div className="col-released">RELEASED</div>
              </div>
              {musics.map((music, index) => (
                <div key={index} className={`table-row ${isSelectMode && selectedMusics.has(music.id) ? 'selected' : ''}`}>
                  {isSelectMode && (
                    <div className="col-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedMusics.has(music.id)}
                        onChange={() => toggleMusicSelection(music.id)}
                      />
                    </div>
                  )}
                  <div className="col-title">
                    <div className="music-item">
                      <div className="music-thumbnail" style={{backgroundImage: `url(${music.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                      <div>
                        <p className="music-title">{music.title}</p>
                        <p className="music-artist">{music.artist}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-artist">{music.artist}</div>
                  <div className="col-plays">{music.plays}</div>
                  <div className="col-duration">{music.duration}</div>
                  <div className="col-released">{music.released}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Playlists Section */}
          <div className="content-section playlists-section">
            <div className="section-header">
              <h2>Playlists</h2>
              <button className="btn-view-all">View All</button>
            </div>
            <div className="playlists-list">
              {playlists.map((playlist, index) => (
                <div key={index} className="playlist-card">
                  <div className="playlist-thumbnails">
                    <div className="thumbnail"></div>
                    <div className="thumbnail"></div>
                  </div>
                  <div className="playlist-info">
                    <h3>{playlist.name}</h3>
                    <p className="playlist-meta">{playlist.updated}</p>
                  </div>
                  <div className="playlist-stats">
                    <p><strong>{playlist.musics} musics</strong></p>
                    <p className="playlist-followers">{playlist.followers} followers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtistDashboard
