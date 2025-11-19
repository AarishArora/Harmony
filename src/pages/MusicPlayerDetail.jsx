import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdShuffle, MdSkipPrevious, MdPlayArrow, MdPause, MdSkipNext, MdPlaylistAdd } from 'react-icons/md';
import './MusicPlayerDetail.css';

function MusicPlayerDetail() {

  const Music_Api = import.meta.env.VITE_MUSIC_URL;

  const { id } = useParams();
  const navigate = useNavigate();
  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const audioRef = useRef(null);

  // Fetch music details
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${Music_Api}/api/music/get-details/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch music');
        }

        const data = await response.json();
        setMusic(data.music);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching music:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, [id]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Fetch playlists when bookmark button is clicked
  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${Music_Api}/api/music/playlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      setPlaylists(data.playlists || []);
      setShowPlaylistModal(true);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      alert('Failed to load playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  // Add music to playlist
  const handleAddToPlaylist = async (playlistId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${Music_Api}/api/music/playlist/add-music`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playlistId,
          musicId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add music to playlist');
      }

      alert('Music added to playlist successfully!');
      setShowPlaylistModal(false);
      setIsLiked(true);
    } catch (err) {
      console.error('Error adding music to playlist:', err);
      alert(err.message || 'Failed to add music to playlist');
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle seek
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false);
  };

  // Format time
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return <div className="player-container"><div className="loading">Loading...</div></div>;
  }

  if (error) {
    return (
      <div className="player-container">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={() => navigate('/')}>Go back to Home</button>
        </div>
      </div>
    );
  }

  if (!music) {
    return (
      <div className="player-container">
        <div className="error">
          <p>Music not found</p>
          <button onClick={() => navigate('/')}>Go back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-container">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      
      <div className="player-content">
        {/* Cover Image */}
        <div className="cover-image-wrapper">
          <img
            src={music.coverImageUrl}
            alt={music.title}
            className={`cover-image ${isPlaying ? 'playing' : ''}`}
          />
          <div className="cover-overlay"></div>
        </div>

        {/* Music Info */}
        <div className="music-info">
          <h1 className="music-title">{music.title}</h1>
          <p className="music-artist">{music.artist}</p>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={music.musicUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        {/* Player Controls */}
        <div className="player-controls">
          {/* Progress Bar Section */}
          <div className="progress-section">
            <span className="time-display">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="progress-bar"
              aria-label="Progress"
            />
            <span className="time-display">{formatTime(duration)}</span>
          </div>

          {/* Main Controls */}
          <div className="main-controls">
            {/* Shuffle Button */}
            <button
              className={`control-btn shuffle-btn ${isShuffle ? 'active' : ''}`}
              onClick={() => setIsShuffle(!isShuffle)}
              aria-label="Shuffle"
            >
              <MdShuffle size={24} />
            </button>

            {/* Previous Button */}
            <button
              className="control-btn prev-btn"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                }
              }}
              aria-label="Previous"
            >
              <MdSkipPrevious size={24} />
            </button>

            {/* Play/Pause Button */}
            <button
              className="control-btn play-pause-btn"
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <MdPause size={24} />
              ) : (
                <MdPlayArrow size={24} />
              )}
            </button>

            {/* Next Button */}
            <button
              className="control-btn next-btn"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(
                    audioRef.current.currentTime + 10,
                    duration
                  );
                }
              }}
              aria-label="Next"
            >
              <MdSkipNext size={24} />
            </button>

            {/* Like/Bookmark Button */}
            <button
              className={`control-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => fetchPlaylists()}
              aria-label="Add to Playlist"
            >
              <MdPlaylistAdd size={24} />
            </button>
          </div>
        </div>

        {/* Playlist Modal */}
        {showPlaylistModal && (
          <div className="modal-overlay" onClick={() => setShowPlaylistModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add to Playlist</h2>
                <button 
                  className="close-btn" 
                  onClick={() => setShowPlaylistModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                {loadingPlaylists ? (
                  <div className="loading">Loading playlists...</div>
                ) : playlists.length === 0 ? (
                  <div className="no-playlists">
                    <p>No playlists found</p>
                  </div>
                ) : (
                  <ul className="playlist-list">
                    {playlists.map((playlist) => (
                      <li key={playlist._id} className="playlist-item">
                        <div className="playlist-info">
                          <p className="playlist-title">{playlist.title}</p>
                          <p className="playlist-songs">
                            {playlist.musics.length} song{playlist.musics.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          className="add-btn"
                          onClick={() => handleAddToPlaylist(playlist._id)}
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MusicPlayerDetail;
