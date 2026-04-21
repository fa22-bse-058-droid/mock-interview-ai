import { useWebcam } from '../../hooks/useWebcam'

type WebcamFeedProps = {
  videoRef: React.RefObject<HTMLVideoElement>
}

const WebcamFeed = ({ videoRef }: WebcamFeedProps) => {
  const { active } = useWebcam(videoRef)

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <video ref={videoRef} autoPlay muted playsInline className="h-52 w-full rounded-lg object-cover" />
      <p className="mt-2 text-xs text-slate-400">Webcam: {active ? 'Active' : 'Unavailable'}</p>
    </div>
  )
}

export default WebcamFeed
