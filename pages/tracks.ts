import type { NextApiRequest, NextApiResponse } from 'next';
import { getTokensFromFirebase } from '../../utils/FirebaseUtil';
import { getRecentlyPlayed, getUsername, isValidToken, refreshAccessToken } from '../../utils/SpotifyAuthUtil';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = req.query.user as string;

    if (!user) {
        return res.status(400).json({ error: 'Missing user ID' });
    }

    try {
        const tokens = await getTokensFromFirebase(user);
        if (!tokens?.accessToken || !tokens?.refreshToken) {
            return res.status(403).json({ error: 'Missing tokens — please reauthorize.' });
        }

        // Refresh if token is invalid
        const validToken = await isValidToken(tokens.accessToken);
        if (!validToken) {
            try {
                const newAccessToken = await refreshAccessToken(tokens.refreshToken);
                tokens.accessToken = newAccessToken;
                await writeTokensToFirebase(user, tokens.accessToken, tokens.refreshToken);
            } catch (e) {
                return res.status(403).json({ error: 'Token refresh failed — please reauthorize.' });
            }
        }

        const username = await getUsername(tokens.accessToken);
        const items = await getRecentlyPlayed(10, tokens.accessToken);

        const tracks = items.map((item: any) => ({
            name: item.track.name,
            artist: item.track.artists.map((a: any) => a.name).join(', '),
            album: item.track.album.name,
            image: item.track.album.images?.[2]?.url ?? '',
            playedAt: item.played_at,
        }));

        return res.status(200).json({ username, tracks });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: e?.message || 'Unknown error' });
    }
}
