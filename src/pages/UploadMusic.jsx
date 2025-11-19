import React, { useState } from 'react'
import './UploadMusic.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function UploadMusic() {

    const Music_Api = import.meta.env.VITE_MUSIC_URL;

    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    music: null,
    coverImage: null
  })

  const [preview, setPreview] = useState({
    musicName: '',
    coverImageName: '',
    coverImageUrl: null,
    musicDuration: null,
    musicSize: null,
    musicUrl: null
  })

  const audioRef = React.useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioPlayer, setAudioPlayer] = useState(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle music file selection
  const handleMusicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setMessage({ type: 'error', text: 'Please select a valid audio file' })
        return
      }
      
      // Get file size
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2)
      
      // Create audio element to get duration
      const audioElement = new Audio()
      const fileUrl = URL.createObjectURL(file)
      audioElement.src = fileUrl
      
      audioElement.onloadedmetadata = () => {
        const minutes = Math.floor(audioElement.duration / 60)
        const seconds = Math.floor(audioElement.duration % 60)
        const duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        
        setPreview(prev => ({
          ...prev,
          musicName: file.name,
          musicDuration: duration,
          musicSize: fileSizeInMB,
          musicUrl: fileUrl
        }))
        
        // Set up audio player
        setAudioPlayer(audioElement)
      }
      
      setFormData(prev => ({
        ...prev,
        music: file
      }))
      setMessage({ type: '', text: '' })
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  // Handle cover image selection
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' })
        return
      }
      
      // Create image preview URL
      const imageUrl = URL.createObjectURL(file)
      
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }))
      setPreview(prev => ({
        ...prev,
        coverImageName: file.name,
        coverImageUrl: imageUrl
      }))
      setMessage({ type: '', text: '' })
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title' })
      return
    }

    if (!formData.music) {
      setMessage({ type: 'error', text: 'Please select a music file' })
      return
    }

    if (!formData.coverImage) {
      setMessage({ type: 'error', text: 'Please select a cover image' })
      return
    }

    // Create FormData for file upload
    const uploadFormData = new FormData()
    uploadFormData.append('title', formData.title)
    uploadFormData.append('music', formData.music)
    uploadFormData.append('coverImage', formData.coverImage)

    try {
      setLoading(true)
      setMessage({ type: '', text: '' })

      const response = await axios.post(
        `${Music_Api}/api/music/upload`,
        uploadFormData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(() =>{
        navigate("/artist/dashboard")
      })

      setMessage({ type: 'success', text: 'Music uploaded successfully!' })
      // Reset form
      setFormData({ title: '', music: null, coverImage: null })
      setPreview({ musicName: '', coverImageName: '' })

      // Clear inputs
      document.getElementById('music-file').value = ''
      document.getElementById('cover-image-file').value = ''

    } catch (error) {
      const errorText = error.response?.data?.message || 'Failed to upload music. Please try again.'
      setMessage({ type: 'error', text: errorText })
    } finally {
      setLoading(false)
    }
  }

  // Handle clear form
  const handleClear = () => {
    setFormData({ title: '', music: null, coverImage: null })
    setPreview({ 
      musicName: '', 
      coverImageName: '',
      coverImageUrl: null,
      musicDuration: null,
      musicSize: null,
      musicUrl: null
    })
    setMessage({ type: '', text: '' })
    document.getElementById('music-file').value = ''
    document.getElementById('cover-image-file').value = ''
    
    // Stop audio and clean up
    if (audioPlayer) {
      audioPlayer.pause()
      audioPlayer.src = ''
    }
    setIsPlaying(false)
    setCurrentTime(0)
    
    // Clean up object URLs
    if (audioRef.current) {
      URL.revokeObjectURL(audioRef.current.src)
    }
  }

  // Play/Pause music
  const handlePlayPause = () => {
    if (!audioPlayer) return
    
    if (isPlaying) {
      audioPlayer.pause()
      setIsPlaying(false)
    } else {
      audioPlayer.play()
      setIsPlaying(true)
      
      // Update current time as audio plays
      const updateTime = () => {
        setCurrentTime(audioPlayer.currentTime)
        if (audioPlayer.playing) {
          requestAnimationFrame(updateTime)
        }
      }
      updateTime()
    }
  }

  // Handle progress bar change
  const handleProgressChange = (e) => {
    if (!audioPlayer) return
    const newTime = parseFloat(e.target.value)
    audioPlayer.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Format time to MM:SS
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className="upload-music-container">
      <div className="upload-music-wrapper">
        {/* Header */}
        <div className="upload-header">
          <h1>Upload Your Music</h1>
          <p className="upload-subtitle">Share your creativity with the world</p>
        </div>

        {/* Alert Messages */}
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            <span>{message.text}</span>
            <button
              className="alert-close"
              onClick={() => setMessage({ type: '', text: '' })}
              aria-label="Close alert"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="upload-form">
          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Music Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter music title"
              className="form-input"
              maxLength={100}
              disabled={loading}
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          {/* Form Grid for Files */}
          <div className="form-grid">
            {/* Music File Input */}
            <div className="form-group">
              <label htmlFor="music-file" className="form-label">
                Music File <span className="required">*</span>
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="music-file"
                  name="music"
                  accept="audio/*"
                  onChange={handleMusicChange}
                  className="file-input"
                  disabled={loading}
                  ref={audioRef}
                />
                <label htmlFor="music-file" className="file-input-label">
                  <div className="file-icon">🎵</div>
                  <div className="file-text">
                    <span className="file-primary">Choose Music</span>
                    <span className="file-secondary">or drag and drop</span>
                  </div>
                </label>
              </div>
              {preview.musicName && (
                <div className="music-preview">
                  <div className="preview-icon">✓</div>
                  <div className="preview-info">
                    <span className="preview-name">{preview.musicName}</span>
                    <div className="preview-meta">
                      {preview.musicDuration && (
                        <span className="meta-item">
                          <span className="meta-label">Duration:</span> {preview.musicDuration}
                        </span>
                      )}
                      {preview.musicSize && (
                        <span className="meta-item">
                          <span className="meta-label">Size:</span> {preview.musicSize} MB
                        </span>
                      )}
                    </div>
                    
                    {/* Music Player */}
                    <div className="music-player">
                      <button 
                        className={`play-btn ${isPlaying ? 'playing' : ''}`}
                        onClick={handlePlayPause}
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? '⏸' : '▶'}
                      </button>
                      
                      <div className="player-controls">
                        <span className="time-display">{formatTime(currentTime)}</span>
                        
                        <input
                          type="range"
                          className="progress-bar"
                          min="0"
                          max={audioPlayer?.duration || 0}
                          value={currentTime}
                          onChange={handleProgressChange}
                          disabled={!audioPlayer}
                        />
                        
                        <span className="time-display">{preview.musicDuration || '0:00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cover Image Input */}
            <div className="form-group">
              <label htmlFor="cover-image-file" className="form-label">
                Cover Image <span className="required">*</span>
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="cover-image-file"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="file-input"
                  disabled={loading}
                />
                <label htmlFor="cover-image-file" className="file-input-label">
                  <div className="file-icon">🖼️</div>
                  <div className="file-text">
                    <span className="file-primary">Choose Image</span>
                    <span className="file-secondary">or drag and drop</span>
                  </div>
                </label>
              </div>
              {preview.coverImageName && (
                <div className="image-preview">
                  <div className="image-preview-container">
                    <img 
                      src={preview.coverImageUrl} 
                      alt="Cover preview" 
                      className="image-preview-img"
                    />
                  </div>
                  <div className="image-preview-info">
                    <div className="preview-icon">✓</div>
                    <span className="preview-name">{preview.coverImageName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Uploading...
                </>
              ) : (
                '↑ Upload Music'
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Clear Form
            </button>
          </div>

          {/* Info Box */}
          <div className="info-box">
            <h3>Upload Guidelines</h3>
            <ul>
              <li><strong>Audio Format:</strong> MP3, WAV, OGG, FLAC, M4A</li>
              <li><strong>Max File Size:</strong> 30MB</li>
              <li><strong>Image Format:</strong> JPG, PNG, GIF, WebP</li>
              <li><strong>Image Size:</strong> Minimum 300x300px</li>
              <li><strong>Title:</strong> Maximum 100 characters</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadMusic
