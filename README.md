# Spotify Recently Played for Framer
Display your recently played Spotify tracks on your Framer website. Powered by [Vercel](https://vercel.com).

Heavily based on [spotify-recently-played-readme by JefferyCA](https://github.com/JeffreyCA/spotify-recently-played-readme) 

## Getting Started
Since Spotify has limited 'Extended Qouta' to organizations only, you can either join my app as a user or deploy your own Vercel app.

## Join My App
Click the button below to fill out my contact form. I will add you as an authorized user to my app

> By authorizing the app, you agree to have your Spotify username, access token, and refresh token stored on a secure Firebase database. This is required so you only need to authorize once and the app can automatically refresh access tokens in order to retrieve recent tracks.
>
> You can revoke the app at https://www.spotify.com/account/apps.

<a href="https://spotify-recently-played-teal.vercel.app"><img src="assets/auth.png" alt="Authorize button" width="160"/></a>

After granting permission, just add the following into my Framer Code below and set the `userid` query parameter to your Spotify username.

### Fetch link
```md
https://spotify-recently-played-teal.vercel.app/api/tracks?user=userid
```
### Framer Code for AutomaticSlider
```sh
import * as React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

export function SpotifySlide({
    textColor,
    font,
    nameSize,
    artistSize,
    timeSize,
    artSize,
    trackCount,
    autoplaySpeed,
    arrowColor,
    cardsPerFrame,
}) {
    const [tracks, setTracks] = useState([])
    const [scrollPos, setScrollPos] = useState(0)
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        fetch(
            "YOUR FETCH LINK GOES HERE"
        )
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
                    gap: 24,
                    transform: `translateX(-${scrollPos}px)`,
                    transition: "transform 0.5s linear",
                    width: "max-content",
                }}
            >
                {tracks.map((track, i) => (
                    <motion.a
                        key={i}
                        href={`https://open.spotify.com/search/${encodeURIComponent(track.name)}`}
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

addPropertyControls(SpotifySlide, {
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#111",
    },
    font: {
        type: ControlType.String,
        title: "Font",
        defaultValue: "Inter, sans-serif",
    },
    nameSize: {
        type: ControlType.Number,
        title: "Track Text",
        min: 10,
        max: 28,
        defaultValue: 16,
    },
    artistSize: {
        type: ControlType.Number,
        title: "Artist Text",
        min: 8,
        max: 24,
        defaultValue: 12,
    },
    timeSize: {
        type: ControlType.Number,
        title: "Time Text",
        min: 8,
        max: 20,
        defaultValue: 11,
    },
    artSize: {
        type: ControlType.Number,
        title: "Album Size",
        min: 60,
        max: 240,
        defaultValue: 160,
    },
    trackCount: {
        type: ControlType.Number,
        title: "Total Tracks",
        min: 2,
        max: 20,
        defaultValue: 10,
    },
    autoplaySpeed: {
        type: ControlType.Number,
        title: "Autoplay Speed",
        min: 100,
        max: 10000,
        defaultValue: 3000,
    },
    arrowColor: {
        type: ControlType.Color,
        title: "Arrow Color",
        defaultValue: "#000",
    },
})
```

## Deploying own Vercel instance
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2FAvishkar15%2Fspotify-recently-played-framer&env=NEXT_PUBLIC_CLIENT_ID,NEXT_PUBLIC_BASE_URL,NEXT_PUBLIC_REDIRECT_URI,CLIENT_SECRET,FIREBASE_PROJECT_ID,FIREBASE_PRIVATE_KEY_B64,FIREBASE_CLIENT_EMAIL)

Deploy your own Vercel instance using the link above. Next, set the following environment variables:

| Name | Description |
|---|---|
| `NEXT_PUBLIC_REDIRECT_URI` | Callback URI from Spotify |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the project |
| `NEXT_PUBLIC_CLIENT_ID` | Spotify app client ID |
| `CLIENT_SECRET` | Spotify app client secret key |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY_B64` | Base64-encoded string of Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email |
| `FIREBASE_DATABASE_URL` | Firebase database URL |


## Running locally
1. Clone Git repo
    ```sh
    $ git clone https://github.com/Avishkar15/spotify-recently-played-framer.git
    ```
2. Install Node dependencies
    ```sh
    $ npm install
    ```
3. Create `.env` file containing required environment variables:
    ```sh
    NEXT_PUBLIC_REDIRECT_URI=<Callback URI from Spotify>
    NEXT_PUBLIC_BASE_URL=<Base URL of the project>
    NEXT_PUBLIC_CLIENT_ID=<Spotify app client ID>
    CLIENT_SECRET=<Spotify app client secret key>
    FIREBASE_PROJECT_ID=<Firebase project ID>
    FIREBASE_PRIVATE_KEY_B64=<Base64-encoded string of Firebase private key>
    FIREBASE_CLIENT_EMAIL=<Firebase client email>
    FIREBASE_DATABASE_URL=<Firebase database URL>
    ```
4. Edit `utils/Constants.ts` and set the `ClientId`, `BaseUrl`, `RedirectUri` values.
5. Run development server
    ```sh
    $ npm run dev
    ```

The app will be running at [http://localhost:3000](http://localhost:3000).


This is a bit of a hacky workaround and may not 100% eliminate the issue. If you have any better solutions or have general optimizations feel free to create a PR!

## License
[MIT](LICENSE)
