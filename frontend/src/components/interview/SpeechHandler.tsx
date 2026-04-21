import { useEffect } from 'react'
import { useSpeech } from '../../hooks/useSpeech'

type SpeechHandlerProps = {
  onTranscript: (text: string) => void
}

const SpeechHandler = ({ onTranscript }: SpeechHandlerProps) => {
  const { supported, isListening, transcript, startListening, stopListening } = useSpeech()

  useEffect(() => {
    onTranscript(transcript)
  }, [transcript, onTranscript])

  if (!supported) return <p className="text-sm text-amber-400">Speech API not supported in this browser.</p>

  return (
    <div className="flex gap-2">
      <button className="rounded bg-emerald-600 px-3 py-2 text-sm" onClick={startListening}>
        {isListening ? 'Listening…' : 'Start'}
      </button>
      <button className="rounded bg-rose-600 px-3 py-2 text-sm" onClick={stopListening}>
        Stop
      </button>
    </div>
  )
}

export default SpeechHandler
