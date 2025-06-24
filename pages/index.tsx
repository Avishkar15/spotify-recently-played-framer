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
import '../styles/dark-theme.css'

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

      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Spotify Recently Played for Framer</h2>
      <p style={{ fontSize: 16, opacity: 0.7, marginBottom: 40 }}>by X.Avishkar</p>

      {!currentUser ? (
        <div style={{ maxWidth: 600, margin: 'auto', marginTop: 20, textAlign: 'center' }}>
          <h3 style={{ fontSize: 24, marginBottom: 12 }}>Add Yourself to the App</h3>
          <p style={{ opacity: 0.7, marginBottom: 24 }}>
            Spotify has limited extended quota access to approved apps only. Before authorizing, please fill out this short form so I can add you to my developer list.
          </p>
          <Button
            type="default"
            href="https://tally.so/r/nWXAoa"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginBottom: 32, borderRadius: '9999px' }}
          >
            Fill Form
          </Button>
          <br />
          <div className="auth-btn">
            <SpotifyAuthButton clientId={ClientId} redirectUri={RedirectUri} />
          </div>
        </div>
      ) : (
        <div>
          <FramerPreview userId={currentUser} />
          <div className="code-block">{code}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
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
              className="clear-btn"
            >
              Clear Credentials
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
