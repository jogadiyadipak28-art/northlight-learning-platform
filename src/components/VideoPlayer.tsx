import { useEffect, useRef, useState } from 'react'
import type { Lesson } from '../types'
import { formatTime } from '../lib/format'
import { isYouTubeVideo, YouTubePlayer } from './YouTubePlayer'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

type Props = {
  lesson: Lesson
  startAt?: number
  onTime: (seconds: number, duration: number) => void
  onComplete: () => void
  captionsOn: boolean
  captionText: string
  seekTo: number | null
}

export function VideoPlayer(props: Props) {
  if (isYouTubeVideo(props.lesson.videoUrl)) {
    return (
      <YouTubePlayer
        lesson={props.lesson}
        startAt={props.startAt}
        seekTo={props.seekTo}
        onTime={props.onTime}
        onComplete={props.onComplete}
      />
    )
  }
  return <HtmlVideoPlayer {...props} />
}

function HtmlVideoPlayer({
  lesson,
  startAt = 0,
  onTime,
  onComplete,
  captionsOn,
  captionText,
  seekTo,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [current, setCurrent] = useState(startAt)
  const [duration, setDuration] = useState(lesson.durationSec)
  const [fullscreen, setFullscreen] = useState(false)
  const completedRef = useRef(false)

  const resumeRef = useRef(startAt)
  resumeRef.current = startAt

  useEffect(() => {
    completedRef.current = false
    const video = videoRef.current
    if (!video) return
    const resume = resumeRef.current
    const applyStart = () => {
      if (resume > 1) {
        const cap = Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.4) : resume
        video.currentTime = Math.min(resume, cap)
      }
    }
    if (video.readyState >= 1) applyStart()
    else video.addEventListener('loadedmetadata', applyStart, { once: true })
  }, [lesson.id])

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed
  }, [speed])

  useEffect(() => {
    if (seekTo == null || !videoRef.current) return
    videoRef.current.currentTime = seekTo
    setCurrent(seekTo)
    onTime(seekTo, duration)
    // Parent onTime identity changes every render; only seek when seekTo changes.
  }, [seekTo])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      }
      if (event.code === 'ArrowRight' && videoRef.current) {
        videoRef.current.currentTime += 5
      }
      if (event.code === 'ArrowLeft' && videoRef.current) {
        videoRef.current.currentTime -= 5
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  const onSeek = (value: number) => {
    const video = videoRef.current
    if (!video) return
    const position = Math.min(value, duration)
    video.currentTime = position
    setCurrent(position)
    onTime(position, duration)
  }

  const cycleSpeed = () => {
    const index = SPEEDS.indexOf(speed)
    const next = SPEEDS[(index + 1) % SPEEDS.length]
    setSpeed(next)
    if (videoRef.current) videoRef.current.playbackRate = next
  }

  const toggleFullscreen = async () => {
    const node = wrapRef.current
    if (!node) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await node.requestFullscreen()
  }

  return (
    <div
      ref={wrapRef}
      className={`player ${fullscreen ? 'is-fs' : ''}`}
      onDoubleClick={() => void toggleFullscreen()}
    >
      <video
        ref={videoRef}
        poster={lesson.poster}
        src={lesson.videoUrl}
        playsInline
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget
          const lessonDuration = Math.min(video.duration || lesson.durationSec, lesson.durationSec)
          setDuration(lessonDuration)
          if (startAt > 1) video.currentTime = Math.min(startAt, Math.max(0, lessonDuration - 0.4))
        }}
        onTimeUpdate={(event) => {
          const video = event.currentTarget
          const d = Math.min(video.duration || duration, lesson.durationSec)
          const t = Math.min(video.currentTime, d)
          setCurrent(t)
          onTime(t, d)
          if (!completedRef.current && d > 0 && t >= d) {
            completedRef.current = true
            video.pause()
            onComplete()
          }
        }}
        onEnded={() => {
          setPlaying(false)
          setCurrent(Math.min(videoRef.current?.duration ?? lesson.durationSec, lesson.durationSec))
          if (!completedRef.current) {
            completedRef.current = true
            onComplete()
          }
        }}
      />
      {captionsOn && captionText ? <div className="caption-overlay">{captionText}</div> : null}
      <div className="controls">
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
          onChange={(event) => onSeek(Number(event.target.value))}
          aria-label="Seek"
        />
        <button type="button" className="ctrl" onClick={cycleSpeed} aria-label="Playback speed">
          {speed}×
        </button>
        <button type="button" className="ctrl" onClick={() => void toggleFullscreen()}>
          {fullscreen ? 'Exit' : 'Full'}
        </button>
      </div>
    </div>
  )
}
