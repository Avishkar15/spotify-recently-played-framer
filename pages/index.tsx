import { Button, message } from 'antd'
import {
  CopyOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import Cookie from 'js-cookie'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import SpotifyAuthButton from '../components/SpotifyAuthButton'
import { ClientId, RedirectUri } from '../utils/Constants'

function FramerPreview({ userId }: { userId: string }) {
  const [tracks, setTracks] = useState<any[]>([])

  useEffect(() => {
    fetch(`https://spotify-recently-played-teal.vercel.app/api/tracks?user=${userId}`)
      .then((res) => res.json())
      .then((data) => setTracks(data.tracks?.slice(0, 10) || []))
      .catch(() => {})
  }, [userId])

  return (
    <div className="preview-wrapper">
      <div className="preview-content">
        {[...tracks, ...tracks].map((track, i) => (
          <a
            key={i}
            href={`https://open.spotify.com/search/${encodeURIComponent(track.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="track-card"
          >
            <img
              src={track.image.replace('ab67616d00004851', 'ab67616d0000b273')}
              alt={track.name}
            />
            <div style={{ fontWeight: 600 }}>{track.name}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{track.artist}</div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>
              {new Date(track.playedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function getFramerCode(userId: string) {
  return `// Spotify Recently Played for Framer — Automatic Scroll by X.Avishkar

import * as React from "react"
import { useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

export function SpotifyAutomaticScroll({
  textColor,
  font,
  nameSize,
  artistSize,
  timeSize,
  artSize,
  artGap,
  trackCount,
  autoplaySpeed,
}) {
  const [tracks, setTracks] = useState([])
  const [scrollPos, setScrollPos] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    fetch("https://spotify-recently-played-teal.vercel.app/api/tracks?user=${userId}")
      .then((res) => res.json())
      .then((data) => {
        if (data?.tracks)
          setTracks([
            ...data.tracks.slice(0, trackCount),
            ...data.tracks.slice(0, trackCount),
          ])
      })
      .catch(() => {})
  }, [trackCount])

  useEffect(() => {
    if (paused || tracks.length === 0) return
    const id = setInterval(() => {
      setScrollPos((prev) => (prev + 1) % (tracks.length * artSize))
    }, autoplaySpeed / 100)
    return () => clearInterval(id)
  }, [paused, autoplaySpeed, tracks, artSize])

  if (!tracks.length)
    return <div style={{ padding: 16, fontFamily: font, color: textColor }}>Loading...</div>

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        fontFamily: font,
        color: textColor,
        position: "relative",
        padding: 16,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        style={{
          display: "flex",
          gap: artGap,
          transform: \`translateX(-\${scrollPos}px)\`,
          transition: "transform 0.5s linear",
          width: "max-content",
        }}
      >
        {tracks.map((track, i) => (
          <a
            key={i}
            href={\`https://open.spotify.com/search/\${encodeURIComponent(track.name)}\`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: textColor,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: artSize,
              transition: "all 0.3s ease",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
            }}
          >
            <img
              src={track.image.replace("ab67616d00004851", "ab67616d0000b273")}
              alt={track.name}
              style={{
                width: artSize,
                height: artSize,
                borderRadius: 12,
                objectFit: "cover",
                marginBottom: 8,
              }}
            />
            <div style={{ fontWeight: 600, fontSize: nameSize }}>{track.name}</div>
            <div style={{ fontSize: artistSize, opacity: 0.7 }}>{track.artist}</div>
            <div style={{ fontSize: timeSize, opacity: 0.5 }}>
              {new Date(track.playedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

addPropertyControls(SpotifyAutomaticScroll, {
  textColor: { type: ControlType.Color, title: "Text Color", defaultValue: "#111" },
  font: { type: ControlType.String, title: "Font", defaultValue: "Satoshi, sans-serif" },
  nameSize: { type: ControlType.Number, title: "Track Text", min: 10, max: 28, defaultValue: 16 },
  artistSize: { type: ControlType.Number, title: "Artist Text", min: 8, max: 24, defaultValue: 12 },
  timeSize: { type: ControlType.Number, title: "Time Text", min: 8, max: 20, defaultValue: 11 },
  artSize: { type: ControlType.Number, title: "Album Size", min: 60, max: 240, defaultValue: 160 },
  artGap: { type: ControlType.Number, title: "Gap between Songs", min: 0, max: 240, defaultValue: 24 },
  trackCount: { type: ControlType.Number, title: "Total Tracks", min: 2, max: 20, defaultValue: 10 },
  autoplaySpeed: { type: ControlType.Number, title: "Autoplay Speed", min: 100, max: 10000, defaultValue: 3000 },
})
`
}

export default function Home() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<string | undefined>(undefined)
  const [code, setCode] = useState<string>('')
  const error = router.query['error']

  useEffect(() => {
    const user = Cookie.get('spotifyuser')
    if (user) {
      setCurrentUser(user)
      setCode(getFramerCode(user))
    }
  }, [])

  const handleClearCreds = () => {
    Cookie.remove('spotifyuser')
    window.location.reload()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    message.success('Copied to clipboard')
  }

  return (
    <div className="container">
      <Head>
        <title>Spotify - Recently Played for Framer</title>
      </Head>

      <h2 style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 700, marginBottom: 4 }}>Spotify Recently Played for Framer</h2>
      <p style={{ fontSize: 20, opacity: 0.7, marginBottom: 40 }}>by X.Avishkar</p>

      {!currentUser ? (
        <div>
          <h3 style={{ color: '#FFFFFF', fontSize: 28, marginBottom: 12 }}>Add Yourself to the App</h3>
          <p style={{ fontSize: 20, opacity: 0.7, marginBottom: 24 }}>
            Spotify has limited extended quota access to Organizations apps only. Before authorizing, please fill out this short form with your 'Spotify Email ID' and add 'Automatic Scroll' in description, so I can add you to my developer list.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
          <Button
            href="https://tally.so/r/nWXAoa"
            className="rounded-btn">
            Fill Form
          </Button>
          <div className="auth-btn">
            <SpotifyAuthButton clientId={ClientId} redirectUri={RedirectUri} />
          </div>
            </div>
        </div>
      ) : (
        <div>
          <h3 style={{ color: '#FFFFFF', fontSize: 28, marginBottom: 12 }}>Automatic Scroll Preview</h3>
          <FramerPreview userId={currentUser} />
          <div className="code-block">{code}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <Button icon={<CopyOutlined />} onClick={handleCopy} className="rounded-btn">
              Copy
            </Button>
            <div className="auth-btn">
              <SpotifyAuthButton
                clientId={ClientId}
                redirectUri={RedirectUri}
                label="Re-authorize"
              />
            </div>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleClearCreds}
              className="clear-btn rounded-btn"
            >
              Clear Credentials
            </Button>
          </div>
        </div>
      )}
      <footer className="footer">
  <div className="footer-inner">
    <h2 style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 700, marginBottom: 4 }}>👋 Thanks for stopping by! Want to see more?</h2>
    <div className="footer-grid">
      <div>
                    <h4 style={{ color:'#ffffff', opacity:0.7 }}>PAGES</h4>
                    <p style={{ fontSize: 20 }}><a href="https://www.avishkarshinde.com" target="_blank">Portfolio ↗</a></p>
                    <p style={{ fontSize: 20 }}><a href="https://www.avishkarshinde.com/aboutme" target="_blank">About Me ↗</a></p>
                    <p style={{ fontSize: 20 }}><a href="https://drive.google.com/file/d/1GhjKALOvIBptKSYsBtHqlll_P_oiofqq/view?usp=drive_link" target="_blank">Resume ↗</a></p>
                  </div>
      
      <div>
        <h4 style={{ color:'#ffffff', opacity:0.7 }}>LET'S CONNECT</h4>
        <p style={{ fontSize: 20 }}>Send me an email to get in touch, or have a snoop of more work below.</p>
        <div className="social-icons">
                    <a href="mailto:avishkarshinde1501@gmail.com" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.icons8.com/ios-filled/24/ffffff/new-post.png" alt="Email" />
                    </a>
                    <a href="https://www.linkedin.com/in/xavishkar/" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.icons8.com/ios-filled/24/ffffff/linkedin.png" alt="LinkedIn" />
                    </a>
                    <a href="https://www.youtube.com/@x.avishkar" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.icons8.com/ios-filled/24/ffffff/youtube-play.png" alt="YouTube" />
                    </a>
                    <a href="https://www.instagram.com/x.avishkar" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.icons8.com/ios-filled/24/ffffff/instagram-new.png" alt="Instagram" />
                    </a>
                    <a href="https://github.com/Avishkar15" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.icons8.com/ios-filled/24/ffffff/github.png" alt="GitHub" />
                    </a>
                  </div>
      </div>
    </div>
  </div>
  <p className="footer-credit">© 2025 Designed by <i>Avishkar</i></p>
</footer>

  </div>
    

  )
}
