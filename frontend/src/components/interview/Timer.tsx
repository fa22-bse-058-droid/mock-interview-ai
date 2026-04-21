import { useEffect, useState } from 'react'

const Timer = () => {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  return <p className="text-sm text-slate-300">Time: {seconds}s</p>
}

export default Timer
