import { Alert, Breadcrumb, Button, Space, Typography, Input, message } from 'antd';
import { CopyOutlined, UserOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import Cookie from 'js-cookie';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SpotifyAuthButton from '../components/SpotifyAuthButton';
import { ClientId, RedirectUri } from '../utils/Constants';

const { Text, Title } = Typography;
const { TextArea } = Input;

// Markdown snippet that includes the Framer component code
function MarkdownSnippet({ username, onUpdate }: { username: string; onUpdate?: (text: string) => void }) {
  const [snippet, setSnippet] = useState<string>('');

  useEffect(() => {
    const code = `// Spotify Recently Played for Framer — Automatic Scroll by X.Avishkar

import * as React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
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
    arrowColor,
    cardsPerFrame,
}) {
    const [tracks, setTracks] = useState([])
    const [scrollPos, setScrollPos] = useState(0)
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        fetch("https://spotify-recently-played-teal.vercel.app/api/tracks?user=${username}")
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
        return (
            <div style={{ padding: 16, fontFamily: font, color: textColor }}>
                Loading...
            </div>
        )

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
            <motion.div
                style={{
                    display: "flex",
                    gap: artGap,
                    transform: \`translateX(-\${scrollPos}px)\`,
                    transition: "transform 0.5s linear",
                    width: "max-content",
                }}
            >
                {tracks.map((track, i) => (
                    <motion.a
                        key={i}
                        href={\`https://open.spotify.com/search/\${encodeURIComponent(track.name)}\`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
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
                        whileTap={{ scale: 0.98 }}
                        whileHover={{
                            scale: 1.07,
                            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25)) brightness(1.1)",
                        }}
                    >
                        <img
                            src={track.image.replace(
                                "ab67616d00004851",
                                "ab67616d0000b273"
                            )}
                            alt={track.name}
                            style={{
                                width: artSize,
                                height: artSize,
                                borderRadius: 12,
                                objectFit: "cover",
                                marginBottom: 8,
                            }}
                        />
                        <div style={{ fontWeight: 600, fontSize: nameSize }}>
                            {track.name}
                        </div>
                        <div style={{ fontSize: artistSize, opacity: 0.7 }}>
                            {track.artist}
                        </div>
                        <div style={{ fontSize: timeSize, opacity: 0.5 }}>
                            {new Date(track.playedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                    </motion.a>
                ))}
            </motion.div>
        </div>
    )
}

addPropertyControls(SpotifyAutomaticScroll, {
    textColor: { type: ControlType.Color, title: "Text Color", defaultValue: "#111" },
    font: { type: ControlType.String, title: "Font", defaultValue: "Inter, sans-serif" },
    nameSize: { type: ControlType.Number, title: "Track Text", min: 10, max: 28, defaultValue: 16 },
    artistSize: { type: ControlType.Number, title: "Artist Text", min: 8, max: 24, defaultValue: 12 },
    timeSize: { type: ControlType.Number, title: "Time Text", min: 8, max: 20, defaultValue: 11 },
    artSize: { type: ControlType.Number, title: "Album Size", min: 60, max: 240, defaultValue: 160 },
    artGap: { type: ControlType.Number, title: "Gap between Songs", min: 0, max: 240, defaultValue: 24 },
    trackCount: { type: ControlType.Number, title: "Total Tracks", min: 2, max: 20, defaultValue: 10 },
    autoplaySpeed: { type: ControlType.Number, title: "Autoplay Speed", min: 100, max: 10000, defaultValue: 3000 },
    arrowColor: { type: ControlType.Color, title: "Arrow Color", defaultValue: "#000" },
})
`
    setSnippet(code)
    if (onUpdate) onUpdate(code)
  }, [username, onUpdate])

  return (
    <div style={{ backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8 }}>
      <Text strong>Framer Snippet:</Text>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginTop: 8 }}>
        {snippet.substring(0, 300)}...
      </pre>
    </div>
  )
}

export default function Home(): JSX.Element {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<string | undefined>(undefined)
  const [markdownText, setMarkdownText] = useState<string>('')
  const error = router.query['error']

  useEffect(() => {
    const user = Cookie.get('spotifyuser')
    if (user) setCurrentUser(user)
  }, [])

  const handleClearCreds = () => {
    Cookie.remove('spotifyuser')
    window.location.reload()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText)
    message.success('Copied to clipboard')
  }

  return (
    <div style={{ padding: 30, maxWidth: 960, margin: 'auto' }}>
      <Head>
        <title>Spotify - Recently Played for Framer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb separator=">" style={{ marginBottom: 25 }}>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>
        <UserOutlined style={{ marginRight: 10 }} />
        Spotify - Recently Played for Framer
      </Title>
      {currentUser && (
        <Text type="secondary">Hello, <strong>{currentUser}</strong>!</Text>
      )}

      {error && <Alert message="Error" description={error} type="error" style={{ marginTop: 12 }} />}

      {!currentUser ? (
        <Space direction="vertical" size="middle" style={{ marginTop: 24 }}>
          <Text>Get started by authorizing the app below.</Text>
          <SpotifyAuthButton clientId={ClientId} redirectUri={RedirectUri} />
        </Space>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 24 }}>
          <MarkdownSnippet username={currentUser} onUpdate={setMarkdownText} />
          <TextArea value={markdownText} rows={12} readOnly />
          <Space>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>Copy</Button>
            <SpotifyAuthButton clientId={ClientId} redirectUri={RedirectUri} label="Re-authorize" icon={<ReloadOutlined />} />
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={handleClearCreds}>Clear Credentials</Button>
          </Space>
        </Space>
      )}
    </div>
  )
}
