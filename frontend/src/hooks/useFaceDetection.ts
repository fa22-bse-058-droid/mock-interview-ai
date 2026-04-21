import { useEffect, useMemo, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

type EyeContact = 'good' | 'poor' | 'unknown'

type FaceDetectionState = {
  faceDetected: boolean
  eyeContact: EyeContact
  expression: string
  confidenceLevel: number
  eyeContactPercentage: number
}

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
const EYE_CONTACT_TOLERANCE = 0.1

const getDominantExpression = (expressions: faceapi.FaceExpressions | undefined) => {
  if (!expressions) return { expression: 'neutral', confidenceLevel: 0 }
  const expressionEntries = Object.entries(expressions) as Array<[string, number]>
  const [expression, value] = expressionEntries.reduce((acc, curr) => (curr[1] > acc[1] ? curr : acc), ['neutral', 0])
  return { expression, confidenceLevel: Math.round(value * 100) }
}

const getEyeContact = (detection: faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>) => {
  const box = detection.detection.box
  const centerX = box.x + box.width / 2
  const nose = detection.landmarks.getNose()[3]
  const horizontalDiffRatio = Math.abs(nose.x - centerX) / box.width
  return horizontalDiffRatio < EYE_CONTACT_TOLERANCE ? 'good' : 'poor'
}

export const useFaceDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [state, setState] = useState<FaceDetectionState>({
    faceDetected: false,
    eyeContact: 'unknown',
    expression: 'neutral',
    confidenceLevel: 0,
    eyeContactPercentage: 0,
  })

  const statsRef = useRef({ checks: 0, goodChecks: 0 })

  const result = useMemo(() => state, [state])

  useEffect(() => {
    let timer: number | null = null
    let cancelled = false

    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      ])
    }

    const runDetection = async () => {
      const video = videoRef.current
      if (!video || video.readyState < 2 || cancelled) return

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 }))
        .withFaceLandmarks(true)
        .withFaceExpressions()

      const face = detections[0]
      if (!face) {
        statsRef.current.checks += 1
        setState((prev) => ({
          ...prev,
          faceDetected: false,
          eyeContact: 'unknown',
          expression: 'no-face',
          confidenceLevel: 0,
          eyeContactPercentage:
            statsRef.current.checks === 0 ? 0 : Math.round((statsRef.current.goodChecks / statsRef.current.checks) * 100),
        }))
        return
      }

      const eyeContact = getEyeContact(face)
      statsRef.current.checks += 1
      if (eyeContact === 'good') statsRef.current.goodChecks += 1

      const { expression, confidenceLevel } = getDominantExpression(face.expressions)

      setState({
        faceDetected: true,
        eyeContact,
        expression,
        confidenceLevel,
        eyeContactPercentage: Math.round((statsRef.current.goodChecks / statsRef.current.checks) * 100),
      })
    }

    const setup = async () => {
      try {
        await loadModels()
        if (cancelled) return

        timer = window.setInterval(() => {
          void runDetection()
        }, 500)
      } catch {
        setState({
          faceDetected: false,
          eyeContact: 'unknown',
          expression: 'model-load-failed',
          confidenceLevel: 0,
          eyeContactPercentage: 0,
        })
      }
    }

    void setup()

    return () => {
      cancelled = true
      if (timer) window.clearInterval(timer)
    }
  }, [videoRef])

  return result
}
