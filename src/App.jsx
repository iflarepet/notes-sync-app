import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './App.css'

function App() {
  const [syncCode, setSyncCode] = useState(() => {
    return localStorage.getItem('syncCode') || null
  })
  const [inputCode, setInputCode] = useState('')
  const [notes, setNotes] = useState(() => {
    const savedCode = localStorage.getItem('syncCode')
    return savedCode ? localStorage.getItem(`notes_${savedCode}`) || '' : ''
  })
  const [showQR, setShowQR] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('syncCode'))
  })
  const [error, setError] = useState('')
  
  const channelRef = useRef(null)

  // Generate random 8-character alphanumeric code
  const generateSyncCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluding confusing chars like O, 0, I, 1
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Initialize or join a sync session
  useEffect(() => {
    if (!syncCode) return

    // Create BroadcastChannel with sync code
    channelRef.current = new BroadcastChannel(`note-sync-${syncCode}`)
    
    // Listen for updates from other tabs with same sync code
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'NOTE_UPDATE' && event.data.syncCode === syncCode) {
        setNotes(event.data.content)
        localStorage.setItem(`notes_${syncCode}`, event.data.content)
      }
    }

    return () => {
      channelRef.current?.close()
    }
  }, [syncCode])

  const handleCreateSession = () => {
    const newCode = generateSyncCode()
    setSyncCode(newCode)
    setNotes('')
    setIsAuthenticated(true)
    localStorage.setItem('syncCode', newCode)
    setError('')
  }

  const handleJoinSession = () => {
    const code = inputCode.trim().toUpperCase()
    if (code.length !== 8) {
      setError('Sync code must be 8 characters')
      return
    }
    setSyncCode(code)
    setNotes(localStorage.getItem(`notes_${code}`) || '')
    setIsAuthenticated(true)
    localStorage.setItem('syncCode', code)
    setError('')
  }

  const handleLogout = () => {
    if (confirm('Leave this sync session? Your notes will remain saved.')) {
      setIsAuthenticated(false)
      setSyncCode(null)
      setNotes('')
      localStorage.removeItem('syncCode')
      if (channelRef.current) {
        channelRef.current.close()
      }
    }
  }

  const handleChange = (e) => {
    const newContent = e.target.value
    setNotes(newContent)
    
    // Save to localStorage with sync code
    localStorage.setItem(`notes_${syncCode}`, newContent)
    
    // Broadcast to other tabs with same sync code
    channelRef.current?.postMessage({
      type: 'NOTE_UPDATE',
      content: newContent,
      syncCode: syncCode,
      timestamp: Date.now()
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(syncCode)
    alert('Sync code copied to clipboard!')
  }

  // Login/Join screen
  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-card">
            <h1>🔐 Note Everywhere</h1>
            <p className="auth-subtitle">Secure synchronized notes</p>
            
            <div className="auth-section">
              <h2>Create New Session</h2>
              <p className="auth-description">
                Generate a unique 8-character code to start syncing your notes securely
              </p>
              <button className="btn btn-primary" onClick={handleCreateSession}>
                🎲 Generate Sync Code
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="auth-section">
              <h2>Join Existing Session</h2>
              <p className="auth-description">
                Enter an 8-character sync code to access shared notes
              </p>
              <input
                type="text"
                className="code-input"
                placeholder="Enter 8-character code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                maxLength={8}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
              />
              {error && <p className="error-message">{error}</p>}
              <button className="btn btn-secondary" onClick={handleJoinSession}>
                🔓 Join Session
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main notes interface
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>📝 Note Everywhere</h1>
            <p className="subtitle">Synced with code: <strong>{syncCode}</strong></p>
          </div>
          <div className="header-actions">
            <button className="btn btn-small" onClick={() => setShowQR(!showQR)}>
              📱 {showQR ? 'Hide' : 'Show'} QR
            </button>
            <button className="btn btn-small" onClick={copyToClipboard}>
              📋 Copy Code
            </button>
            <button className="btn btn-small btn-logout" onClick={handleLogout}>
              🚪 Leave Session
            </button>
          </div>
        </div>
      </header>

      {showQR && (
        <div className="qr-container">
          <div className="qr-card">
            <h3>Scan to Join Session</h3>
            <QRCodeSVG 
              value={syncCode} 
              size={200}
              level="H"
              includeMargin={true}
            />
            <p className="qr-code-text">{syncCode}</p>
            <p className="qr-instruction">Share this QR code or the code above to sync notes</p>
          </div>
        </div>
      )}
      
      <main className="main">
        <textarea
          className="note-textarea"
          value={notes}
          onChange={handleChange}
          placeholder="Start typing... your notes will sync with anyone using the same code!"
          autoFocus
        />
      </main>
      
      <footer className="footer">
        <p>🔒 Only users with your sync code can see and edit these notes</p>
      </footer>
    </div>
  )
}

export default App
