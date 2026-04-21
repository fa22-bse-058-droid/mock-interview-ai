import { useEffect, useRef, useState } from 'react'
import { useFaceDetection } from '../../hooks/useFaceDetection'

type WebcamFeedProps = {
  isRecording: boolean
  onFaceUpdate?: (faceData: {
    faceDetected: boolean
    eyeContact: 'good' | 'poor' | 'unknown'
    expression: string
    confidenceLevel: number
    eyeContactPercentage: number
  }) => void
}

const WebcamFeed = ({ isRecording, onFaceUpdate }: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  const faceData = useFaceDetection(videoRef)

  useEffect(() => {
    onFaceUpdate?.(faceData)
  }, [faceData, onFaceUpdate])

  useEffect(() => {
    let stream: MediaStream | null = null

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraReady(true)
        }
      } catch {
        setPermissionDenied(true)
      }
    }

    void initCamera()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  if (permissionDenied) {
    return (
      <div className="rounded-3xl border border-[#EF4444]/50 bg-white/5 p-5 text-sm text-slate-200 backdrop-blur-2xl">
        Camera permission denied. Please allow camera access and reload.
      </div>
    )
  }

  return (
    <div className={`rounded-3xl border bg-white/5 p-5 backdrop-blur-2xl transition-all duration-300 ${isRecording ? 'border-[#10B981] shadow-[0_0_35px_rgba(16,185,129,0.3)]' : 'border-white/10'}`}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <video ref={videoRef} autoPlay muted playsInline className="h-72 w-full bg-black object-cover" />
        {isRecording && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            REC
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-slate-200">{cameraReady ? 'Camera Ready' : 'Connecting Camera...'}</span>
        <span className={`rounded-full border px-2 py-1 ${faceData.eyeContact === 'good' ? 'border-[#10B981]/60 text-[#10B981]' : faceData.eyeContact === 'poor' ? 'border-[#F59E0B]/60 text-[#F59E0B]' : 'border-slate-400/60 text-slate-300'}`}>
          Eye Contact: {faceData.eyeContact.toUpperCase()}
        </span>
        <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-slate-200">
          Expression: {faceData.expression}
        </span>
      </div>
    </div>
  )
}

export default WebcamFeed
