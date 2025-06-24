import { Alert, Breadcrumb, Button, Space, Typography, Input, message } from 'antd'
import { CopyOutlined, UserOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import Cookie from 'js-cookie'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import SpotifyAuthButton from '../components/SpotifyAuthButton'
import { ClientId, RedirectUri } from '../utils/Constants'

const { Text, Title } = Typography
const { TextArea } = Input

// Preview of how the component will look in Framer
function FramerPreview({ userId }: { userId: string }) {
  const [tracks, setTracks] = useState<any[]>([])

  useEffect(() => {
    fetch(`https://spotify-recently-played-teal.vercel.app/api/tracks?user=${userId}`)
      .then((res) => res.json())
      .then((data) => setTracks(data.tracks?.slice(0, 10) || []))
      .catch(() => {})
  }, [userId])

  return (
    <div style={{ display: 'flex', gap: 24, overflowX: 'auto', padding: '12px 0' }}>
      {tracks.map((track, i) => (
        <a
          key={i}
          href={`https://open.spotify.com/search/${encodeURIComponent(track.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            minWidth: 160,
            flexShrink: 0,
            textDecoration: 'none',
            color: '#111',
            textAlign: 'center',
          }}
        >
          <img
            src={track.image.replace('ab67616d00004851', 'ab67616d0000b273')}
            alt={track.name}
            style={{
              width: 160,
              height: 160,
              borderRadius: 12,
              objectFit: 'cover',
              marginBottom: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <div style={{ fontWeight: 600 }}>{track.name}</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{track.artist}</div>
        </a>
      ))}
    </div>
  )
}

// Returns full code snippet
function getFramerCode(username: string) {
  return `// Spotify Recently Played for Framer — Automatic Scroll by X.Avishkar

// Replace 'userid' with your actual Spotify user: "${username}"

fetch("https://spotify-recently-played-teal.vercel.app/api/tracks?user=${username}")
.then(res => res.json())
.then(data => {
  // Use data.tracks in your Framer component
})`
}

export default function Home(): JSX.Element {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<string | undefined>(undefined)
  const [framerCode, setFramerCode] = useState<string>('')
  const error = router.query['error']

  useEffect(() => {
    const user = Cookie.get('spotifyuser')
    if (user) {
      setCurrentUser(user)
      setFramerCode(getFramerCode(user))
    }
  }, [])

  const handleClearCreds = () => {
    Cookie.remove('spotifyuser')
    window.location.reload()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(framerCode)
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
      {currentUser && <Text type="secondary">Hello, <strong>{currentUser}</strong>!</Text>}
      {error && <Alert message="Error" description={error} type="error" style={{ marginTop: 12 }} />}

      {!currentUser ? (
        <Space direction="vertical" size="middle" style={{ marginTop: 24 }}>
          <Text>Get started by authorizing the app below.</Text>
          <SpotifyAuthButton clientId={ClientId} redirectUri={RedirectUri} />
        </Space>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 24 }}>
          <Text strong>Preview:</Text>
          <FramerPreview userId={currentUser} />

          <Text strong>Framer Code Snippet:</Text>
          <TextArea value={framerCode} rows={6} readOnly />

          <Space>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>Copy</Button>
            <SpotifyAuthButton
  clientId={ClientId}
  redirectUri={RedirectUri}
  label="Re-authorize"
/>

            <Button type="primary" danger icon={<DeleteOutlined />} onClick={handleClearCreds}>Clear Credentials</Button>
          </Space>
        </Space>
      )}
    </div>
  )
}
