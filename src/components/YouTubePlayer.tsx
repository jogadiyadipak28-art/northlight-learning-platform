import { useEffect, useId, useRef, useState } from 'react'
import type { Lesson } from '../types'
import { formatTime } from '../lib/format'

type Player = {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  destroy: () => void
}

type PlayerEvent = { target: Player; data?: number }
type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      playerVars: Record<string, number | string>
      events: {
        onReady: (event: PlayerEvent) => void
        onStateChange: (event: PlayerEvent) => void
        onError: () => void
      }
    },
  ) => Player
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YouTubeApi> | null = null

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('The video player could not be loaded.'))
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.onerror = () => reject(new Error('The video player could not be loaded.'))
      document.head.appendChild(script)
    }
  })

  return apiPromise
}

function getVideoId(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1)
    if (parsed.hostname.endsWith('youtube.com')) {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v')
      const embed = parsed.pathname.match(/^\/embed\/([^/]+)/)
      return embed?.[1] ?? null
    }
  } catch {
    return null
  }
  return null
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function isYouTubeVideo(url: string) {
  return Boolean(getVideoId(url))
}

export function YouTubePlayer({
  lesson,
  startAt = 0,
  seekTo,
  onTime,
  onComplete,
}: {
  lesson: Lesson
  startAt?: number
  seekTo: number | null
  onTime: (seconds: number, duration: number) => void
  onComplete: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const onTimeRef = useRef(onTime)
  const onCompleteRef = useRef(onComplete)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(startAt)
  const [duration, setDuration] = useState(lesson.durationSec)
  const [speed, setSpeed] = useState(1)
  const [error, setError] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const playerId = useId()
  const videoId = getVideoId(lesson.videoUrl)

  onTimeRef.current = onTime
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!videoId || !hostRef.current) return
    let disposed = false
    let createdPlayer: Player | null = null

    void loadYouTubeApi()
      .then((youtube) => {
        if (disposed || !hostRef.current) return
        createdPlayer = new youtube.Player(hostRef.current, {
          videoId,
          playerVars: {
            controls: 1,
            enablejsapi: 1,
            playsinline: 1,
            rel: 0,
            cc_load_policy: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              playerRef.current = target
              const total = target.getDuration()
              if (total > 0) setDuration(total)
              if (startAt > 0) target.seekTo(startAt, true)
            },
            onStateChange: ({ data }) => {
              setPlaying(data === 1)
              if (data === 0) onCompleteRef.current()
            },
            onError: () => setError(true),
          },
        })
        playerRef.current = createdPlayer
      })
      .catch(() => setError(true))

    const poll = window.setInterval(() => {
      const player = playerRef.current
      if (!player) return
      const time = player.getCurrentTime()
      const total = player.getDuration()
      setPlaying(player.getPlayerState() === 1)
      if (!Number.isFinite(time) || !Number.isFinite(total) || total <= 0) return
      setCurrent(time)
      setDuration(total)
      onTimeRef.current(time, total)
    }, 900)

    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreen)

    return () => {
      disposed = true
      window.clearInterval(poll)
      document.removeEventListener('fullscreenchange', onFullscreen)
      createdPlayer?.destroy()
      playerRef.current = null
    }
  }, [videoId, lesson.id])

  useEffect(() => {
    if (seekTo == null || !playerRef.current) return
    playerRef.current.seekTo(seekTo, true)
    setCurrent(seekTo)
  }, [seekTo])

  const togglePlay = () => {
    const player = playerRef.current
    if (!player) return
    if (playing) player.pauseVideo()
    else player.playVideo()
    setPlaying(!playing)
  }

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]
    setSpeed(next)
    playerRef.current?.setPlaybackRate(next)
  }

  const toggleFullscreen = async () => {
    const node = wrapRef.current
    if (!node) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await node.requestFullscreen()
  }

  return (
    <>
      <div
        ref={wrapRef}
        className={`player youtube-player ${fullscreen ? 'is-fs' : ''}`}
        onDoubleClick={() => void toggleFullscreen()}
      >
        <div id={playerId} ref={hostRef} className="youtube-host" />
        {error ? (
          <div className="video-error">
            <p>This lesson video could not be embedded.</p>
            {videoId ? (
              <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer">
                Open the video on YouTube
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="controls youtube-controls">
        <button type="button" className="ctrl" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <span className="time-readout">
          {formatTime(current)} / {formatTime(duration)}
        </span>
        <input
          className="seek"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(current, duration || 0)}
          onChange={(event) => {
            const position = Number(event.target.value)
            playerRef.current?.seekTo(position, true)
            setCurrent(position)
          }}
          aria-label="Seek"
        />
        <button type="button" className="ctrl" onClick={cycleSpeed} aria-label="Playback speed">
          {speed}×
        </button>
        <button type="button" className="ctrl" onClick={() => void toggleFullscreen()}>
          {fullscreen ? 'Exit' : 'Full'}
        </button>
      </div>
    </>
  )
}
