import { useEffect, useState } from 'react'

export const useWebcam = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = stream
        setActive(true)
      } catch {
        setActive(false)
      }
    }

    start()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [videoRef])

  return { active }
}
