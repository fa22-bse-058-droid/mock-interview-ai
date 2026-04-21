import { useEffect } from 'react'
import * as faceapi from 'face-api.js'

export const useFaceDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onScoreUpdate: (score: number) => void,
) => {
  useEffect(() => {
    let timer: number | undefined
    let mounted = true

    const run = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      } catch {
        onScoreUpdate(50)
        return
      }

      timer = window.setInterval(async () => {
        const video = videoRef.current
        if (!video || video.readyState < 2 || !mounted) return

        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        onScoreUpdate(detection ? 90 : 40)
      }, 2000)
    }

    run()

    return () => {
      mounted = false
      if (timer) window.clearInterval(timer)
    }
  }, [videoRef, onScoreUpdate])
}
