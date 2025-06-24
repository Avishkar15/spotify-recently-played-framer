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

// Inline MarkdownSnippet component with onUpdate support
function MarkdownSnippet({ username, onUpdate }: { username: string; onUpdate?: (text: string) => void }) {
  const [snippet, setSnippet] = useState<string>('');

  useEffect(() => {
    const generated = `![Spotify Recently Played](https://spotify-recently-played-readme.vercel.app/api/recently-played?user=${username})`;
    setSnippet(generated);
    if (onUpdate) onUpdate(generated);
  }, [username, onUpdate]);

  return (
    <div style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 }}>
      <Text strong>Markdown Snippet Preview:</Text>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginTop: 8 }}>{snippet}</pre>
    </div>
  );
}

export default function Home(): JSX.Element {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | undefined>(undefined);
  const [markdownText, setMarkdownText] = useState<string>('');
  const error = router.query['error'];

  useEffect(() => {
    const user = Cookie.get('spotifyuser');
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleClearCreds = () => {
    Cookie.remove('spotifyuser');
    window.location.reload();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    message.success('Copied to clipboard');
  };

  return (
    <div className="container" style={{ padding: 30, maxWidth: 800, margin: 'auto' }}>
      <Head>
        <title>Spotify - Recently Played for Framer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Breadcrumb separator=">" style={{ marginBottom: 25 }}>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}><UserOutlined style={{ marginRight: 10 }} />Spotify - Recently Played for Framer</Title>
      {currentUser && <Text type="secondary">Hello, <strong>{currentUser}</strong>!</Text>}

      {error && <Alert message="Error" description={error} type="error" style={{ marginBottom: 18 }} />}

      {!currentUser ? (
        <Space direction="vertical" size="middle">
          <Text>Get started by authorizing the app below.</Text>
          <SpotifyAuthButton clientId={ClientId} redirectUri={RedirectUri} />
        </Space>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 24 }}>
          <MarkdownSnippet username={currentUser} onUpdate={setMarkdownText} />
          <TextArea value={markdownText} rows={6} readOnly />
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
  );
}
